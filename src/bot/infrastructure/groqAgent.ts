import type { Agent } from "../application/ports";
import { validateAction } from "../domain/validate";
import { groqChat } from "./groqClient";

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

/** Interpreta texto libre como una Action validada. null si el LLM falla o responde algo inválido. */
export function createGroqAgent(cfg: { apiKey: string; model: string; fetchImpl?: typeof fetch }): Agent {
  return async (text, _locale, today) => {
    const content = await groqChat({ ...cfg, system: system(today), user: text, temperature: 0 });
    const json = content?.match(/\{[\s\S]*\}/)?.[0];
    if (!json) return null;
    try {
      return validateAction(JSON.parse(json)); // lo que dice el LLM nunca se guarda sin validar
    } catch {
      return null;
    }
  };
}
