import { createLogger } from "../../lib/logger";
import { execute } from "../domain/actions";
import { parseCommand } from "../domain/commands";
import { norm } from "../domain/faq";
import { KNOWLEDGE, type BotLocale } from "../domain/knowledge";
import type { Deps } from "./ports";
import { answerPublic } from "./publicReply";

const log = createLogger("bot");

export type Reply = { text: string; menu: string[] };
export type ReplyInput = { text: string; chatId: number; updateId: number; locale: BotLocale };

/**
 * Caso de uso: decide cómo responder a un mensaje.
 * Orden: /id, /start → botones del menú (FAQ) → [autorizado] comandos fijos → IA →
 * [público] FAQ → IA de preguntas → mensaje por defecto.
 * Devuelve null cuando el mensaje es un reintento ya procesado.
 */
export async function buildReply({ text, chatId, updateId, locale }: ReplyInput, deps: Deps): Promise<Reply | null> {
  const k = KNOWLEDGE[locale];
  const allowed = deps.isAllowed(chatId);
  const store = allowed ? deps.store : null;
  const menu = store ? k.menuPersonal : k.menu;

  if (/^\/id\b/i.test(text)) {
    // Diagnóstico: solo indica si cada pieza está configurada, sin mostrar secretos.
    return {
      menu,
      text: [
        `chat id: ${chatId}`,
        `autorizado (TELEGRAM_ALLOWED_CHAT_IDS): ${allowed ? "sí" : "no"}`,
        `Upstash configurado: ${deps.store ? "sí" : "no"}`,
        `Groq configurado: ${deps.agent ? "sí" : "no"}`,
      ].join("\n"),
    };
  }
  if (/^\/(start|help)\b/i.test(text)) return { text: store ? k.welcomePersonal : k.welcome, menu };

  const isMenuLabel = [...KNOWLEDGE.es.menu, ...KNOWLEDGE.en.menu].some((l) => norm(l) === norm(text));

  if (store && !isMenuLabel) {
    try {
      const today = deps.today();
      const data = await store.load(chatId);
      if (updateId <= data.lastUpdate) return null; // reintento de Telegram: ya lo procesamos
      const action = parseCommand(text) ?? (deps.agent ? await deps.agent(text, locale, today) : null);
      if (action?.action === "unsupported") return { text: k.unsupported, menu };
      if (action && action.action !== "faq") {
        const { text: out, changed } = execute(action, data, locale, today);
        if (changed) {
          data.lastUpdate = updateId;
          await store.save(chatId, data);
        }
        return { text: out, menu };
      }
    } catch (e) {
      log.error("fallo en datos personales", e); // degradamos al modo público en vez de romper
    }
  }

  return { text: await answerPublic(text, locale, deps.answerer, k.fallback), menu };
}
