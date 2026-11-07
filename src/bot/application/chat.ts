import { CHAT_MAX_LENGTH } from "../../config/chat";
import { pickLocale } from "../domain/detect";
import { KNOWLEDGE } from "../domain/knowledge";
import type { ChatDeps } from "./ports";
import { answerPublic } from "./publicReply";

export { CHAT_MAX_LENGTH };
export type ChatInput = { message: unknown; locale: unknown; ip: string };
export type ChatResult = { status: "ok"; reply: string } | { status: "invalid" } | { status: "rate_limited" };

/**
 * Chat de la web: SOLO responde preguntas públicas. No recibe ni usa almacén de datos personales,
 * así que no puede leer ni escribir nada de nadie.
 */
export async function handleChat(input: ChatInput, deps: ChatDeps): Promise<ChatResult> {
  if (typeof input.message !== "string") return { status: "invalid" };
  const text = input.message.trim();
  if (!text || text.length > CHAT_MAX_LENGTH) return { status: "invalid" };
  if (!(await deps.limiter.allow(input.ip))) return { status: "rate_limited" };
  const locale = pickLocale(text, typeof input.locale === "string" ? input.locale : undefined);
  return { status: "ok", reply: await answerPublic(text, locale, deps.answerer, KNOWLEDGE[locale].fallbackWeb) };
}
