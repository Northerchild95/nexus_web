import type { BotLocale } from "./knowledge";
import type { Action } from "./types";
import { validateAction } from "./validate";

const URL = "https://api.groq.com/openai/v1/chat/completions";

const system = (today: string) => `Eres el intérprete del asistente de Nexus Life en Telegram. Hoy es ${today} (zona America/Bogota).
Convierte el mensaje del usuario en UNA acción. Responde SOLO con un objeto JSON, sin texto ni markdown.
Acciones posibles:
{"action":"add_expense","amount":number,"category":"food|transport|leisure|health|other","note":string,"date":"YYYY-MM-DD"}
{"action":"add_task","title":string,"due":"YYYY-MM-DD","priority":"high|medium|low"}
{"action":"complete_task","match":string}
{"action":"list_tasks"}
{"action":"add_habit","habit":string,"date":"YYYY-MM-DD"}
{"action":"query_expenses","period":"today|week|month","category":"food|transport|leisure|health|other"}
{"action":"query_habits","period":"today|week|month","habit":string}
{"action":"faq"}  (preguntas sobre qué es la app, funciones, precio, lanzamiento, saludos)
{"action":"unsupported"}  (recordatorios, borrar o editar datos, cualquier otra cosa)
Reglas: montos en pesos colombianos sin decimales ("18 mil" o "18k" = 18000). Resuelve fechas relativas (mañana, el viernes) a YYYY-MM-DD; omite "date" o "due" si no se mencionan. Omite los campos opcionales que no apliquen. No inventes datos.`;

/** Interpreta texto libre. Devuelve null si el LLM falla o responde algo inválido. */
export async function askAgent(text: string, _locale: BotLocale, today: string): Promise<Action | null> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL ?? "openai/gpt-oss-20b",
        messages: [{ role: "system", content: system(today) }, { role: "user", content: text.slice(0, 500) }],
        max_tokens: 1000,
        temperature: 0,
        reasoning_effort: "low",
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error("[bot] agente Groq", res.status, await res.text());
      return null;
    }
    const content: string = (await res.json()).choices?.[0]?.message?.content ?? "";
    const json = content.match(/\{[\s\S]*\}/)?.[0];
    return json ? validateAction(JSON.parse(json)) : null;
  } catch (e) {
    console.error("[bot] agente fallo", e);
    return null;
  }
}
