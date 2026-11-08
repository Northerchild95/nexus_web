export type SubscriberLocale = "es" | "en";
export type SubscriberStatus = "pending" | "confirmed" | "unsubscribed";

export type Subscriber = {
  email: string;
  locale: SubscriberLocale;
  status: SubscriberStatus;
  token: string; // sirve para confirmar y para darse de baja
  createdAt: number;
  lastEmailAt: number; // último correo de confirmación enviado
};
