import { bogotaToday, execute } from "./actions";
import { askAgent } from "./agent";
import { parseCommand } from "./commands";
import { matchFaq, norm } from "./faq";
import { askLlm } from "./llm";
import { KNOWLEDGE, type BotLocale } from "./knowledge";
import { loadData, saveData, storeConfigured } from "./store";

export type Reply = { text: string; menu: string[] };
type Input = { text: string; chatId: number; updateId: number; locale: BotLocale };

/** Solo estos chats pueden guardar datos personales (protege privacidad y cuota gratuita). */
const isAllowed = (chatId: number) =>
  (process.env.TELEGRAM_ALLOWED_CHAT_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean).includes(String(chatId));

/**
 * Orden: /id, /start → botones del menú (FAQ) → [si está autorizado] comandos fijos → IA →
 * [público] FAQ → IA de preguntas → mensaje por defecto.
 */
export async function buildReply({ text, chatId, updateId, locale }: Input): Promise<Reply | null> {
  const k = KNOWLEDGE[locale];
  const personal = isAllowed(chatId) && storeConfigured();
  const menu = personal ? k.menuPersonal : k.menu;

  if (/^\/id\b/i.test(text)) {
    // Diagnóstico: no muestra ningún secreto, solo si cada pieza está configurada.
    const allowed = isAllowed(chatId);
    return {
      text: [
        `chat id: ${chatId}`,
        `autorizado (TELEGRAM_ALLOWED_CHAT_IDS): ${allowed ? "sí" : "no"}`,
        `Upstash configurado: ${storeConfigured() ? "sí" : "no"}`,
        `Groq configurado: ${process.env.GROQ_API_KEY ? "sí" : "no"}`,
      ].join("\n"),
      menu,
    };
  }
  if (/^\/(start|help)\b/i.test(text)) return { text: personal ? k.welcomePersonal : k.welcome, menu };

  const isMenuLabel = [...KNOWLEDGE.es.menu, ...KNOWLEDGE.en.menu].some((l) => norm(l) === norm(text));

  if (personal && !isMenuLabel) {
    try {
      const today = bogotaToday();
      const data = await loadData(chatId);
      if (updateId <= data.lastUpdate) return null; // reintento de Telegram: ya lo procesamos
      const action = parseCommand(text) ?? (await askAgent(text, locale, today));
      if (action?.action === "unsupported") return { text: k.unsupported, menu };
      if (action && action.action !== "faq") {
        const { text: out, changed } = execute(action, data, locale, today);
        if (changed) {
          data.lastUpdate = updateId;
          await saveData(chatId, data);
        }
        return { text: out, menu };
      }
    } catch (e) {
      console.error("[bot] datos personales", e);
    }
  }

  const answer = matchFaq(text, locale) ?? (await askLlm(text, locale)) ?? k.fallback;
  return { text: answer, menu };
}
