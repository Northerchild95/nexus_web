import { matchFaq } from "./faq";
import { askLlm } from "./llm";
import { KNOWLEDGE, type BotLocale } from "./knowledge";

export function detectLocale(text: string, telegramLang?: string): BotLocale {
  // Si el texto tiene señales claras de español, priorizarlo (aunque Telegram esté en inglés).
  if (/[áéíóúñ¿¡]/i.test(text)) return "es";
  const esHints = /\b(que|qué|como|cómo|para|cuando|cuándo|donde|dónde|precio|cuesta|hola|tarea|tareas|habito|habitos|gasto|gastos|finanzas|lanzamiento|funciones|sirve|puedo)\b/i;
  const enHints = /\b(what|how|when|where|price|pricing|hello|hi|task|tasks|habit|habits|expense|expenses|finance|launch|features|download|can i)\b/i;
  const es = esHints.test(text);
  const en = enHints.test(text);
  if (es && !en) return "es";
  if (en && !es) return "en";
  return telegramLang?.toLowerCase().startsWith("en") ? "en" : "es";
}

/** Orden: comandos → FAQ (gratis, instantáneo) → IA → mensaje por defecto. */
export async function buildReply(
  text: string,
  telegramLang?: string,
): Promise<{ text: string; locale: BotLocale }> {
  const locale = detectLocale(text, telegramLang);
  const k = KNOWLEDGE[locale];
  if (/^\/(start|help)\b/i.test(text)) return { text: k.welcome, locale };
  const textOut = matchFaq(text, locale) ?? (await askLlm(text, locale)) ?? k.fallback;
  return { text: textOut, locale };
}
