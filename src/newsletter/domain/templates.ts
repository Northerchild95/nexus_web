import type { SubscriberLocale } from "./types";

export type EmailContent = { subject: string; html: string; text: string };

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const COPY = {
  es: {
    subject: "Confirma tu suscripción a Nexus Life",
    title: "Confirma tu correo",
    body: "Gracias por tu interés en Nexus Life. Confirma tu correo para que te avisemos cuando la app esté lista.",
    button: "Confirmar suscripción",
    ignore: "Si no fuiste tú, ignora este mensaje: no recibirás nada más.",
    unsubscribe: "Darme de baja",
  },
  en: {
    subject: "Confirm your Nexus Life subscription",
    title: "Confirm your email",
    body: "Thanks for your interest in Nexus Life. Confirm your email so we can let you know when the app is ready.",
    button: "Confirm subscription",
    ignore: "If this wasn't you, just ignore this message: you won't receive anything else.",
    unsubscribe: "Unsubscribe",
  },
} as const;

/** Correo de confirmación (doble opt-in), con enlace de baja. Texto plano incluido para clientes sin HTML. */
export function confirmationEmail(locale: SubscriberLocale, links: { confirmUrl: string; unsubscribeUrl: string }): EmailContent {
  const c = COPY[locale];
  const confirm = escapeHtml(links.confirmUrl);
  const unsub = escapeHtml(links.unsubscribeUrl);
  const html = `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#10203a">
<h1 style="font-size:22px;margin:0 0 12px">${c.title}</h1>
<p style="line-height:1.6;margin:0 0 20px">${c.body}</p>
<p style="margin:0 0 24px"><a href="${confirm}" style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px">${c.button}</a></p>
<p style="font-size:13px;color:#60708a;line-height:1.5;margin:0">${c.ignore}<br><a href="${unsub}" style="color:#60708a">${c.unsubscribe}</a></p>
</div>`;
  const text = `${c.title}\n\n${c.body}\n\n${c.button}: ${links.confirmUrl}\n\n${c.ignore}\n${c.unsubscribe}: ${links.unsubscribeUrl}`;
  return { subject: c.subject, html, text };
}
