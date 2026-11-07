import { createLogger } from "../../lib/logger";

const log = createLogger("groq");
const URL = "https://api.groq.com/openai/v1/chat/completions";

export type GroqOptions = {
  apiKey: string;
  model: string;
  system: string;
  user?: string; // un solo mensaje
  history?: { role: "user" | "assistant"; content: string }[]; // o una conversación
  temperature?: number;
  fetchImpl?: typeof fetch; // inyectable para pruebas
};

/** Una llamada de chat a Groq. Devuelve el texto o null si algo falla (nunca lanza). */
export async function groqChat(o: GroqOptions): Promise<string | null> {
  try {
    const res = await (o.fetchImpl ?? fetch)(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${o.apiKey}` },
      body: JSON.stringify({
        model: o.model,
        messages: [
          { role: "system", content: o.system },
          ...(o.history ?? [{ role: "user" as const, content: o.user ?? "" }]).map((m) => ({ ...m, content: m.content.slice(0, 500) })),
        ],
        max_tokens: 1000, // margen: los modelos de razonamiento gastan tokens pensando
        temperature: o.temperature ?? 0.3,
        reasoning_effort: "low",
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      log.error("respuesta no válida", { status: res.status, body: (await res.text()).slice(0, 300) });
      return null;
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (e) {
    log.error("fallo de red o timeout", e);
    return null;
  }
}
