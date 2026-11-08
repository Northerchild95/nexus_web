import type { Mailer } from "../application/ports";

type Cfg = { apiKey: string; fromEmail: string; fromName: string; fetchImpl?: typeof fetch };

async function ensureOk(provider: string, res: Response) {
  if (!res.ok) throw new Error(`${provider} ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

/** Brevo: el remitente se verifica con un correo (no exige dominio propio). */
export function createBrevoMailer({ apiKey, fromEmail, fromName, fetchImpl = fetch }: Cfg): Mailer {
  return async (m) => {
    const res = await fetchImpl("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email: m.to }],
        subject: m.subject,
        htmlContent: m.html,
        textContent: m.text,
        ...(m.unsubscribeUrl && { headers: { "List-Unsubscribe": `<${m.unsubscribeUrl}>` } }),
      }),
      signal: AbortSignal.timeout(8000),
    });
    await ensureOk("Brevo", res);
  };
}

/** Resend: para enviar a cualquier persona hay que verificar un dominio propio. */
export function createResendMailer({ apiKey, fromEmail, fromName, fetchImpl = fetch }: Cfg): Mailer {
  return async (m) => {
    const res = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [m.to],
        subject: m.subject,
        html: m.html,
        text: m.text,
        ...(m.unsubscribeUrl && { headers: { "List-Unsubscribe": `<${m.unsubscribeUrl}>` } }),
      }),
      signal: AbortSignal.timeout(8000),
    });
    await ensureOk("Resend", res);
  };
}
