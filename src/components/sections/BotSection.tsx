import { useLocale, useTranslations } from "next-intl";
import { KNOWLEDGE, type BotLocale } from "@/bot/domain/knowledge";

// Los mensajes del chat de muestra salen de la misma base de conocimiento que usa el bot real.
const Q1_FAQ = 0; // "qué es"
const Q2_FAQ = 6; // "precio"

function Bubble({ from, children }: { from: "user" | "bot"; children: React.ReactNode }) {
  const mine = from === "user";
  return (
    <p className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-5 ${
      mine ? "ml-auto bg-brand-600 text-white" : "bg-surfaceStrong"}`}>
      {children}
    </p>
  );
}

export default function BotSection() {
  const t = useTranslations("Bot");
  const faqs = KNOWLEDGE[useLocale() as BotLocale].faqs;
  const bot = process.env.NEXT_PUBLIC_TELEGRAM_BOT; // usuario público del bot (no es un secreto)

  return (
    <section id="bot" className="mx-auto grid max-w-6xl scroll-mt-24 items-center gap-12 px-6 py-24 md:grid-cols-2">
      <div>
        <h2 className="text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">{t("title")}</h2>
        <p className="mt-4 text-lg leading-7 text-muted">{t("lead")}</p>
        {bot ? (
          <a href={`https://t.me/${bot}`} target="_blank" rel="noopener noreferrer"
            className="mt-8 inline-block rounded-full bg-brand-600 px-6 py-3 font-semibold text-white shadow-lift">
            {t("cta")}
          </a>
        ) : (
          <span className="mt-8 inline-block rounded-full bg-surfaceStrong px-6 py-3 font-semibold text-muted">
            {t("soon")}
          </span>
        )}
      </div>
      <div aria-hidden className="space-y-3 rounded-4xl bg-card p-6 shadow-card">
        <Bubble from="user">{t("q1")}</Bubble>
        <Bubble from="bot">{faqs[Q1_FAQ].answer}</Bubble>
        <Bubble from="user">{t("q2")}</Bubble>
        <Bubble from="bot">{faqs[Q2_FAQ].answer}</Bubble>
      </div>
    </section>
  );
}
