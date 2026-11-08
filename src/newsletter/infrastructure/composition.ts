import type { SubscribeDeps } from "../application/ports";
import { createLimiter } from "../../shared/infrastructure/limiters";
import { createBrevoMailer, createResendMailer } from "./mailer";
import { createSubscriberStore } from "./subscriberStore";

type Env = Record<string, string | undefined>;

export const randomToken = (): string => {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(""); // 48 caracteres hex
};

/** Único lugar que lee el entorno del newsletter. Devuelve null si falta algo (la función queda desactivada). */
export function createSubscribeDeps(env: Env = process.env): SubscribeDeps | null {
  const { UPSTASH_REDIS_REST_URL: url, UPSTASH_REDIS_REST_TOKEN: token, EMAIL_FROM: fromEmail } = env;
  if (!url || !token || !fromEmail) return null;
  const cfg = { fromEmail, fromName: env.EMAIL_FROM_NAME ?? "Nexus Life" };
  const mailer = env.BREVO_API_KEY
    ? createBrevoMailer({ ...cfg, apiKey: env.BREVO_API_KEY })
    : env.RESEND_API_KEY
      ? createResendMailer({ ...cfg, apiKey: env.RESEND_API_KEY })
      : null;
  if (!mailer) return null;
  return {
    store: createSubscriberStore(url, token),
    mailer,
    // 5 intentos por visitante por hora y 80 correos al día en total (por debajo de los topes gratuitos).
    limiter: createLimiter(env, { prefix: "sub:ip:", limit: 5, windowSec: 3600 }),
    emailBudget: createLimiter(env, { prefix: "sub:mail:", limit: 80, windowSec: 86400 }),
    token: randomToken,
    now: Date.now,
  };
}
