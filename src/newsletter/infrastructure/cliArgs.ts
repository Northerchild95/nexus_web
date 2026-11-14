import { CAMPAIGN_IDS, isCampaignId, type CampaignId } from "../domain/campaigns";
import { normalizeEmail } from "../domain/email";
import type { SubscriberLocale } from "../domain/types";

export type CliArgs = { campaign: CampaignId; site: string; ctaUrl: string; limit: number; send: boolean; testTo?: string; locale: SubscriberLocale };
export type ParsedArgs = { ok: true; args: CliArgs } | { ok: false; error: string };

const SITE = /^(https:\/\/[^\s/?#]+|http:\/\/localhost(:\d+)?)\/?$/;
const URL_OK = /^https?:\/\/[^\s]+$/;

/** Lee `--clave valor`, `--clave=valor` y banderas (`--send`). Función pura: se prueba sin ejecutar nada. */
export function parseArgs(argv: string[]): ParsedArgs {
  const opts = new Map<string, string | true>();
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) return { ok: false, error: `Argumento inesperado: ${a}` };
    const [k, inline] = a.slice(2).split(/=(.*)/s);
    if (inline !== undefined) opts.set(k, inline);
    else if (k === "send") opts.set(k, true);
    else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith("--")) opts.set(k, argv[++i]);
    else return { ok: false, error: `Falta el valor de --${k}` };
  }
  const get = (k: string) => (typeof opts.get(k) === "string" ? (opts.get(k) as string) : undefined);

  const campaign = get("campaign");
  if (!isCampaignId(campaign)) return { ok: false, error: `--campaign es obligatorio. Opciones: ${CAMPAIGN_IDS.join(", ")}` };
  const siteRaw = get("site");
  if (!siteRaw || !SITE.test(siteRaw)) return { ok: false, error: "--site es obligatorio y debe ser tu dominio real, p. ej. https://tu-sitio.vercel.app" };
  const site = siteRaw.replace(/\/$/, "");
  const ctaUrl = get("cta") ?? site;
  if (!URL_OK.test(ctaUrl)) return { ok: false, error: "--cta debe ser una URL http(s) válida" };
  const limit = get("limit") === undefined ? 100 : Number(get("limit"));
  if (!Number.isInteger(limit) || limit < 1 || limit > 500) return { ok: false, error: "--limit debe ser un entero entre 1 y 500" };
  const send = opts.get("send") === true;
  const testRaw = get("test");
  const testTo = testRaw === undefined ? undefined : normalizeEmail(testRaw) ?? undefined;
  if (testRaw !== undefined && !testTo) return { ok: false, error: "--test necesita un correo válido" };
  if (send && testTo) return { ok: false, error: "Usa --test o --send, no los dos a la vez" };
  const locale: SubscriberLocale = get("locale") === "en" ? "en" : "es";
  return { ok: true, args: { campaign, site, ctaUrl, limit, send, testTo, locale } };
}
