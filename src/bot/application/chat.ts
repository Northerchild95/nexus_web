import { CHAT_MAX_LENGTH, CHAT_MAX_TURNS, type ChatTurn } from "../../config/chat";
import { pickLocale } from "../domain/detect";
import { matchFaq, norm } from "../domain/faq";
import { KNOWLEDGE } from "../domain/knowledge";
import type { ChatDeps } from "./ports";

export { CHAT_MAX_LENGTH };
export type ChatInput = { messages: unknown; locale: unknown; ip: string };
export type ChatResult = { status: "ok"; reply: string } | { status: "invalid" } | { status: "rate_limited" };

/** Valida el historial recibido: roles correctos, textos acotados y el último mensaje es del usuario. */
export function parseTurns(raw: unknown): ChatTurn[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > CHAT_MAX_TURNS * 2) return null;
  const turns: ChatTurn[] = [];
  for (const item of raw) {
    const role = (item as { role?: unknown })?.role;
    const content = (item as { content?: unknown })?.content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim();
    if (!text || text.length > CHAT_MAX_LENGTH) return null;
    turns.push({ role, content: text });
  }
  return turns[turns.length - 1].role === "user" ? turns.slice(-CHAT_MAX_TURNS) : null;
}

const menuLabels = () => [...KNOWLEDGE.es.menu, ...KNOWLEDGE.en.menu].map(norm);

/**
 * Chat de la web: conversación con contexto. Los botones sugeridos usan respuestas fijas (no gastan IA);
 * el resto va al conversador. Si la IA no está disponible, cae a la FAQ. No recibe el almacén de datos personales.
 */
export async function handleChat(input: ChatInput, deps: ChatDeps): Promise<ChatResult> {
  const turns = parseTurns(input.messages);
  if (!turns) return { status: "invalid" };
  if (!(await deps.limiter.allow(input.ip))) return { status: "rate_limited" };

  const last = turns[turns.length - 1].content;
  const locale = pickLocale(last, typeof input.locale === "string" ? input.locale : undefined);
  const faq = matchFaq(last, locale);

  if (faq && menuLabels().includes(norm(last))) return { status: "ok", reply: faq };
  const ai = deps.converser ? await deps.converser(turns, locale) : null;
  return { status: "ok", reply: ai ?? faq ?? KNOWLEDGE[locale].fallbackWeb };
}
