import { buildContactChannels } from "@/lib/contact";

// Único lugar que lee las variables públicas de contacto. Todas son opcionales.
export const contactChannels = buildContactChannels({
  telegram: process.env.NEXT_PUBLIC_TELEGRAM_BOT,
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  github: process.env.NEXT_PUBLIC_GITHUB_URL,
});

export const telegramChannel = contactChannels.find((c) => c.id === "telegram");
/** La sección Contacto solo aparece si aporta algo más que el botón de Telegram. */
export const showContactSection = contactChannels.length >= 2;
