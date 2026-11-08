/** La suscripción solo se activa si hay almacén, remitente y un proveedor de correo configurados. */
export const subscribeEnabled = Boolean(
  process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN &&
    process.env.EMAIL_FROM &&
    (process.env.BREVO_API_KEY || process.env.RESEND_API_KEY),
);

/** Páginas a las que redirigen los enlaces del correo (/{locale}/newsletter/{status}). */
export const NEWSLETTER_STATUSES = ["confirmed", "unsubscribed", "invalid", "error"] as const;
export type NewsletterStatus = (typeof NEWSLETTER_STATUSES)[number];
export const isNewsletterStatus = (v: string): v is NewsletterStatus => (NEWSLETTER_STATUSES as readonly string[]).includes(v);
