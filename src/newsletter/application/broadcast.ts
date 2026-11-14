import { createLogger } from "../../lib/logger";
import type { CampaignId } from "../domain/campaigns";
import { campaignEmail } from "../domain/templates";
import type { Subscriber } from "../domain/types";
import type { CampaignLedger, Mailer, SubscriberStore } from "./ports";

const log = createLogger("broadcast");

export type BroadcastPlan = { recipients: Subscriber[]; totalConfirmed: number; alreadySent: number; remainingAfter: number };

/** Decide a quién enviar: confirmados que aún no recibieron esta campaña, hasta `limit` por ejecución. No envía nada. */
export async function planBroadcast(
  o: { campaign: CampaignId; limit: number },
  deps: { store: Pick<SubscriberStore, "listConfirmed">; ledger: CampaignLedger },
): Promise<BroadcastPlan> {
  const confirmed = (await deps.store.listConfirmed()).filter((s) => s.status === "confirmed"); // defensa extra
  const sent = await deps.ledger.sentTo(o.campaign);
  const pending = confirmed.filter((s) => !sent.has(s.email));
  const recipients = pending.slice(0, o.limit);
  return { recipients, totalConfirmed: confirmed.length, alreadySent: confirmed.length - pending.length, remainingAfter: pending.length - recipients.length };
}

export type BroadcastReport = { attempted: number; sent: number; failed: number; aborted: boolean; failures: { email: string; error: string }[] };

export type BroadcastOptions = { campaign: CampaignId; site: string; ctaUrl: string; delayMs: number; maxConsecutiveFailures: number };

/**
 * Envía a cada destinatario con su enlace de baja personal. Registra cada envío exitoso; si el proveedor falla
 * varias veces seguidas (key inválida, límite diario, caída) se detiene en vez de seguir golpeándolo.
 */
export async function runBroadcast(
  recipients: Subscriber[],
  o: BroadcastOptions,
  deps: { mailer: Mailer; ledger: CampaignLedger; sleep: (ms: number) => Promise<void> },
  onProgress?: (done: number, total: number, email: string, ok: boolean) => void,
): Promise<BroadcastReport> {
  const report: BroadcastReport = { attempted: 0, sent: 0, failed: 0, aborted: false, failures: [] };
  let consecutive = 0;
  for (const s of recipients) {
    const unsubscribeUrl = `${o.site}/api/subscribe/unsubscribe?token=${s.token}&locale=${s.locale}`;
    const content = campaignEmail(o.campaign, s.locale, { buttonUrl: o.ctaUrl, unsubscribeUrl });
    report.attempted++;
    try {
      await deps.mailer({ to: s.email, ...content, unsubscribeUrl });
      await deps.ledger.markSent(o.campaign, s.email); // tras enviar: si el proceso muere justo aquí, la persona podría recibirlo dos veces
      report.sent++;
      consecutive = 0;
      onProgress?.(report.attempted, recipients.length, s.email, true);
    } catch (e) {
      report.failed++;
      consecutive++;
      report.failures.push({ email: s.email, error: e instanceof Error ? e.message : String(e) });
      log.error("falló un envío", e);
      onProgress?.(report.attempted, recipients.length, s.email, false);
      if (consecutive >= o.maxConsecutiveFailures) {
        report.aborted = true;
        break;
      }
    }
    if (o.delayMs > 0) await deps.sleep(o.delayMs);
  }
  return report;
}
