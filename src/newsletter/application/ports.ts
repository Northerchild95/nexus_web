import type { RateLimiter } from "../../shared/application/ports";
import type { Subscriber } from "../domain/types";

export interface SubscriberStore {
  get(email: string): Promise<Subscriber | null>;
  byToken(token: string): Promise<Subscriber | null>;
  save(subscriber: Subscriber): Promise<void>;
  /** Todas las personas con estado "confirmed". */
  listConfirmed(): Promise<Subscriber[]>;
}

/** Registro de a quién ya se le envió cada campaña: evita duplicar envíos si se vuelve a ejecutar. */
export interface CampaignLedger {
  sentTo(campaignId: string): Promise<Set<string>>;
  markSent(campaignId: string, email: string): Promise<void>;
}
export type MailMessage = { to: string; subject: string; html: string; text: string; unsubscribeUrl?: string };
/** Envía un correo. Lanza si el proveedor lo rechaza. */
export type Mailer = (message: MailMessage) => Promise<void>;

export type SubscribeDeps = {
  store: SubscriberStore;
  mailer: Mailer;
  limiter: RateLimiter; // por visitante
  emailBudget: RateLimiter; // tope diario de correos enviados (protege la cuota gratuita)
  token: () => string;
  now: () => number;
};
