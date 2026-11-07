import { useLocale, useTranslations } from "next-intl";
import { KNOWLEDGE, type BotLocale } from "@/bot/domain/knowledge";
import ChatWidget from "./ChatWidget";

/** Server Component: traduce las etiquetas y pasa solo datos simples al componente de cliente. */
export default function Chat() {
  const t = useTranslations("Chat");
  const locale = useLocale();
  const suggestions = KNOWLEDGE[(locale === "en" ? "en" : "es") as BotLocale].menu;
  return (
    <ChatWidget
      locale={locale}
      suggestions={suggestions}
      labels={{
        open: t("open"), close: t("close"), title: t("title"), greeting: t("greeting"), suggestions: t("suggestions"),
        placeholder: t("placeholder"), send: t("send"), reset: t("reset"), thinking: t("thinking"), error: t("error"), rateLimited: t("rateLimited"),
      }}
    />
  );
}
