import { guessCategory } from "./actions";
import type { Action } from "./types";

function parseAmount(raw: string): number | null {
  let s = raw.replace(/\s/g, "").toLowerCase();
  const k = s.endsWith("k") || s.endsWith("mil");
  s = s.replace(/mil$|k$/, "");
  s = /^\d{1,3}([.,]\d{3})+$/.test(s) ? s.replace(/[.,]/g, "") : s.replace(",", ".");
  const n = Number(s) * (k ? 1000 : 1);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

/** Comandos exactos que no necesitan IA. Devuelve null si el texto no es un comando. */
export function parseCommand(text: string): Action | null {
  const t = text.trim();
  let m: RegExpMatchArray | null;

  if ((m = t.match(/^\/?(?:gast[eé]|gasto|expense|spent)\s+(\S+)\s*(.*)$/i))) {
    const amount = parseAmount(m[1]);
    if (amount) {
      const note = m[2].replace(/^(en|on|in|de|for)\s+/i, "").trim();
      return { action: "add_expense", amount, category: guessCategory(note), note };
    }
  }
  if ((m = t.match(/^\/?(?:tarea|task|todo)\s+(.+)$/i))) return { action: "add_task", title: m[1].trim(), priority: "medium" };
  if ((m = t.match(/^\/?(?:hecho|listo|done|completar|complete)\s+(.+)$/i))) return { action: "complete_task", match: m[1].trim() };
  if ((m = t.match(/^\/?(?:habito|hábito|habit)\s+(.+)$/i))) return { action: "add_habit", habit: m[1].trim() };
  if (/^(\/tareas|\/tasks|mis tareas|my tasks)$/i.test(t)) return { action: "list_tasks" };
  if (/^(\/gastos|\/expenses|mis gastos|my expenses)$/i.test(t)) return { action: "query_expenses", period: "month" };
  return null;
}
