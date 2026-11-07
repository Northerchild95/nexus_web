export type ChatOutcome = { ok: true; reply: string } | { ok: false; reason: "rate_limited" | "error" };

/** Llamada del navegador a /api/chat. Nunca lanza: siempre devuelve un resultado que la UI puede mostrar. */
export async function postChat(message: string, locale: string, fetchImpl: typeof fetch = fetch): Promise<ChatOutcome> {
  try {
    const res = await fetchImpl("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, locale }),
    });
    if (res.status === 429) return { ok: false, reason: "rate_limited" };
    if (!res.ok) return { ok: false, reason: "error" };
    const data = await res.json();
    return typeof data.reply === "string" ? { ok: true, reply: data.reply } : { ok: false, reason: "error" };
  } catch {
    return { ok: false, reason: "error" };
  }
}
