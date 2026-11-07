export type ContactChannel = { id: "telegram" | "email" | "github"; href: string };
/** Los enlaces http(s) se abren en pestaña nueva; mailto: no. */
export const linkAttrs = (c: ContactChannel) =>
  c.id === "email" ? {} : { target: "_blank", rel: "noopener noreferrer" };

export type ContactInput = { telegram?: string; email?: string; github?: string };

/** Solo canales con datos válidos: nunca se muestra un enlace roto ni inseguro. */
export function buildContactChannels({ telegram, email, github }: ContactInput): ContactChannel[] {
  const channels: ContactChannel[] = [];
  const tg = telegram?.trim().replace(/^@/, "");
  if (tg && /^[A-Za-z0-9_]{4,32}$/.test(tg)) channels.push({ id: "telegram", href: `https://t.me/${tg}` });
  const mail = email?.trim();
  if (mail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) channels.push({ id: "email", href: `mailto:${mail}` });
  const gh = github?.trim();
  if (gh && /^https:\/\/(www\.)?github\.com\/[\w.-]+(\/[\w.-]+)?\/?$/.test(gh)) channels.push({ id: "github", href: gh });
  return channels;
}
