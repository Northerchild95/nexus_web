import { createLogger } from "../../lib/logger";
import { isValidToken, normalizeEmail } from "../domain/email";
import { confirmationEmail } from "../domain/templates";
import type { Subscriber, SubscriberLocale } from "../domain/types";
import type { SubscribeDeps } from "./ports";

const log = createLogger("newsletter");

export const CONFIRM_TTL_MS = 7 * 24 * 3600_000; // el enlace de confirmación vale 7 días
export const RESEND_COOLDOWN_MS = 10 * 60_000; // no reenviar el correo a la misma persona antes de 10 min

export type SubscribeInput = { email: unknown; locale: unknown; honeypot: unknown; baseUrl: string; ip: string };
export type SubscribeResult = { status: "ok" | "invalid" | "rate_limited" | "unavailable" };

const asLocale = (l: unknown): SubscriberLocale => (l === "en" ? "en" : "es");

/**
 * Inicia la suscripción (doble opt-in). La respuesta es la misma exista o no el correo, para no
 * revelar quién está suscrito. Solo guarda "pending": se activa cuando la persona hace clic en el enlace.
 */
export async function subscribe(input: SubscribeInput, deps: SubscribeDeps): Promise<SubscribeResult> {
  if (typeof input.honeypot === "string" && input.honeypot.trim()) return { status: "ok" }; // bot: fingimos éxito
  const email = normalizeEmail(input.email);
  if (!email) return { status: "invalid" };
  if (!(await deps.limiter.allow(input.ip))) return { status: "rate_limited" };

  const now = deps.now();
  const existing = await deps.store.get(email);
  if (existing?.status === "confirmed") return { status: "ok" };
  if (existing?.status === "pending" && now - existing.lastEmailAt < RESEND_COOLDOWN_MS) return { status: "ok" };
  if (!(await deps.emailBudget.allow("global"))) return { status: "unavailable" };

  const subscriber: Subscriber = {
    email,
    locale: asLocale(input.locale),
    status: "pending",
    token: existing?.token ?? deps.token(),
    createdAt: existing?.createdAt ?? now,
    lastEmailAt: now,
  };
  await deps.store.save(subscriber);

  const q = `token=${subscriber.token}&locale=${subscriber.locale}`;
  const unsubscribeUrl = `${input.baseUrl}/api/subscribe/unsubscribe?${q}`;
  const content = confirmationEmail(subscriber.locale, { confirmUrl: `${input.baseUrl}/api/subscribe/confirm?${q}`, unsubscribeUrl });
  try {
    await deps.mailer({ to: email, ...content, unsubscribeUrl });
    return { status: "ok" };
  } catch (e) {
    log.error("no se pudo enviar el correo de confirmación", e);
    await deps.store.save({ ...subscriber, lastEmailAt: 0 }); // permite reintentar de inmediato
    return { status: "unavailable" };
  }
}

export type TokenDeps = Pick<SubscribeDeps, "store" | "now">;

export async function confirmSubscription(token: unknown, deps: TokenDeps): Promise<"confirmed" | "invalid"> {
  if (!isValidToken(token)) return "invalid";
  const s = await deps.store.byToken(token);
  if (!s || s.status === "unsubscribed") return "invalid";
  if (s.status === "confirmed") return "confirmed"; // idempotente (p. ej. un antivirus ya abrió el enlace)
  if (deps.now() - s.lastEmailAt > CONFIRM_TTL_MS) return "invalid";
  await deps.store.save({ ...s, status: "confirmed" });
  return "confirmed";
}

export async function unsubscribe(token: unknown, deps: TokenDeps): Promise<"unsubscribed" | "invalid"> {
  if (!isValidToken(token)) return "invalid";
  const s = await deps.store.byToken(token);
  if (!s) return "invalid";
  if (s.status !== "unsubscribed") await deps.store.save({ ...s, status: "unsubscribed" });
  return "unsubscribed";
}
