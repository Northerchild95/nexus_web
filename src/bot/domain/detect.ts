import type { BotLocale } from "./knowledge";

const ES = new Set(["que", "como", "cuando", "cuanto", "donde", "hola", "gracias", "tiene", "puedo", "sirve", "para", "tareas", "habitos", "gastos", "precio", "funciones", "foco", "finanzas", "lanzamiento"]);
const EN = new Set(["the", "what", "how", "when", "does", "can", "is", "are", "price", "hello", "thanks", "tasks", "habits", "spending", "features", "focus", "finance", "release"]);

const strip = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/** Idioma por el texto del mensaje; si es ambiguo, usa el idioma de Telegram. */
export function pickLocale(text: string, languageCode?: string): BotLocale {
  const words = strip(text).match(/[a-z]+/g) ?? [];
  const es = words.filter((w) => ES.has(w)).length + (/[¿¡áéíóúñ]/i.test(text) ? 1 : 0);
  const en = words.filter((w) => EN.has(w)).length;
  if (es > en) return "es";
  if (en > es) return "en";
  return languageCode?.startsWith("en") ? "en" : "es";
}
