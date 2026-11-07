import { matchFaq } from "./faq";
import { askLlm } from "./llm";
import { KNOWLEDGE, type BotLocale } from "./knowledge";

/** Orden: comandos → FAQ (gratis, instantáneo) → IA → mensaje por defecto. */
export async function buildReply(text: string, locale: BotLocale): Promise<string> {
  const k = KNOWLEDGE[locale];
  if (/^\/(start|help)\b/i.test(text)) return k.welcome;
  return matchFaq(text, locale) ?? (await askLlm(text, locale)) ?? k.fallback;
}
