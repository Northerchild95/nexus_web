import { matchFaq } from "../domain/faq";
import type { BotLocale } from "../domain/knowledge";
import type { Answerer } from "./ports";

/** Respuesta pública (sin datos personales): FAQ → IA acotada → texto por defecto. La usan Telegram y el chat web. */
export async function answerPublic(text: string, locale: BotLocale, answerer: Answerer | null, fallback: string): Promise<string> {
  return matchFaq(text, locale) ?? (answerer ? await answerer(text, locale) : null) ?? fallback;
}
