import { KNOWLEDGE, type BotLocale } from "./knowledge";

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s'-]/g, " ");

/** Devuelve la respuesta de la FAQ con más palabras clave coincidentes, o null. */
export function matchFaq(text: string, locale: BotLocale): string | null {
  const q = norm(text);
  let best: string | null = null;
  let top = 0;
  for (const faq of KNOWLEDGE[locale].faqs) {
    const score = faq.keywords.filter((k) => q.includes(norm(k))).length;
    if (score > top) {
      top = score;
      best = faq.answer;
    }
  }
  return best;
}
