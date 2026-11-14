import { CAMPAIGNS, type CampaignId } from "./campaigns";
import type { SubscriberLocale } from "./types";

export type EmailContent = { subject: string; html: string; text: string };

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

type Copy = { title: string; body: string; button: string; footer: string; unsubscribe: string };

/** Diseño común de todos los correos: título, texto, un botón y pie con enlace de baja. HTML + texto plano. */
function render(c: Copy, urls: { buttonUrl: string; unsubscribeUrl: string }): { html: string; text: string } {
  const button = escapeHtml(urls.buttonUrl);
  const unsub = escapeHtml(urls.unsubscribeUrl);
  const html = `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#10203a">
<h1 style="font-size:22px;margin:0 0 12px">${escapeHtml(c.title)}</h1>
<p style="line-height:1.6;margin:0 0 20px">${escapeHtml(c.body)}</p>
<p style="margin:0 0 24px"><a href="${button}" style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px">${escapeHtml(c.button)}</a></p>
<p style="font-size:13px;color:#60708a;line-height:1.5;margin:0">${escapeHtml(c.footer)}<br><a href="${unsub}" style="color:#60708a">${escapeHtml(c.unsubscribe)}</a></p>
</div>`;
  const text = `${c.title}\n\n${c.body}\n\n${c.button}: ${urls.buttonUrl}\n\n${c.footer}\n${c.unsubscribe}: ${urls.unsubscribeUrl}`;
  return { html, text };
}

const CONFIRM = {
  es: { subject: "Confirma tu suscripción a Nexus Life", title: "Confirma tu correo", body: "Gracias por tu interés en Nexus Life. Confirma tu correo para que te avisemos cuando la app esté lista.", button: "Confirmar suscripción", footer: "Si no fuiste tú, ignora este mensaje: no recibirás nada más.", unsubscribe: "Darme de baja" },
  en: { subject: "Confirm your Nexus Life subscription", title: "Confirm your email", body: "Thanks for your interest in Nexus Life. Confirm your email so we can let you know when the app is ready.", button: "Confirm subscription", footer: "If this wasn't you, just ignore this message: you won't receive anything else.", unsubscribe: "Unsubscribe" },
} as const;

/** Correo de confirmación (doble opt-in), con enlace de baja. */
export function confirmationEmail(locale: SubscriberLocale, links: { confirmUrl: string; unsubscribeUrl: string }): EmailContent {
  const { subject, ...copy } = CONFIRM[locale];
  return { subject, ...render(copy, { buttonUrl: links.confirmUrl, unsubscribeUrl: links.unsubscribeUrl }) };
}

const CAMPAIGN_FOOTER = {
  es: { footer: "Recibes este correo porque te suscribiste en nuestra página.", unsubscribe: "Darme de baja" },
  en: { footer: "You're receiving this because you subscribed on our website.", unsubscribe: "Unsubscribe" },
} as const;

/** Correo de una campaña (aviso de lanzamiento, novedades…), con el enlace de baja de cada persona. */
export function campaignEmail(id: CampaignId, locale: SubscriberLocale, urls: { buttonUrl: string; unsubscribeUrl: string }): EmailContent {
  const { subject, ...copy } = CAMPAIGNS[id][locale];
  return { subject, ...render({ ...copy, ...CAMPAIGN_FOOTER[locale] }, urls) };
}
