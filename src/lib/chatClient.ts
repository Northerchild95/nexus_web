import { CHAT_CONTEXT_CHARS, CHAT_MAX_TURNS, type ChatTurn } from "../config/chat";

export type ChatOutcome = { ok: true; reply: string } | { ok: false; reason: "rate_limited" | "error" };
export type UiMessage = { role: "user" | "bot"; text: string; error?: boolean };

/** Convierte los mensajes de la UI en el historial que se envía: sin errores y solo los más recientes. */
export function toHistory(messages: UiMessage[]): ChatTurn[] {
  return messages
    .filter((m) => !m.error)
    .slice(-CHAT_MAX_TURNS)
    .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text.slice(0, CHAT_CONTEXT_CHARS) }));
}

/** Llamada del navegador a /api/chat. Nunca lanza: siempre devuelve un resultado que la UI puede mostrar. */
export async function postChat(messages: ChatTurn[], locale: string, fetchImpl: typeof fetch = fetch): Promise<ChatOutcome> {
  try {
    const res = await fetchImpl("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, locale }),
    });
    if (res.status === 429) return { ok: false, reason: "rate_limited" };
    if (!res.ok) return { ok: false, reason: "error" };
    const data = await res.json();
    return typeof data.reply === "string" ? { ok: true, reply: data.reply } : { ok: false, reason: "error" };
  } catch {
    return { ok: false, reason: "error" };
  }
}
