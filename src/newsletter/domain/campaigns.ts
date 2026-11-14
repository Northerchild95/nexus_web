import type { SubscriberLocale } from "./types";

export type CampaignCopy = { subject: string; title: string; body: string; button: string };

/** Campañas que se pueden enviar. Edita los textos antes de enviar: lo que ves aquí es lo que recibirán. */
export const CAMPAIGNS = {
  launch: {
    es: { subject: "Nexus Life ya está disponible", title: "¡Ya llegó Nexus Life!", body: "Te suscribiste para enterarte cuando la app estuviera lista, y ese día llegó. Entra y empieza a organizar tus días con claridad.", button: "Conocer Nexus Life" },
    en: { subject: "Nexus Life is now available", title: "Nexus Life is here!", body: "You subscribed to hear when the app was ready, and that day has come. Come in and start organizing your days with clarity.", button: "Discover Nexus Life" },
  },
  update: {
    es: { subject: "Novedades de Nexus Life", title: "Tenemos novedades", body: "Avanzamos en Nexus Life y queremos contártelo. Pasa por la página para ver lo último.", button: "Ver las novedades" },
    en: { subject: "Nexus Life news", title: "We have news", body: "We've been making progress on Nexus Life and want to tell you about it. Stop by the website to see the latest.", button: "See what's new" },
  },
} as const satisfies Record<string, Record<SubscriberLocale, CampaignCopy>>;

export type CampaignId = keyof typeof CAMPAIGNS;
export const CAMPAIGN_IDS = Object.keys(CAMPAIGNS) as CampaignId[];
export const isCampaignId = (v: unknown): v is CampaignId => typeof v === "string" && v in CAMPAIGNS;
