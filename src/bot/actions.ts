import { norm } from "./faq";
import type { BotLocale } from "./knowledge";
import type { Action, Category, Period, UserData } from "./types";

const LABEL: Record<BotLocale, Record<Category, string>> = {
  es: { food: "comida", transport: "transporte", leisure: "ocio", health: "salud", other: "otros" },
  en: { food: "food", transport: "transport", leisure: "leisure", health: "health", other: "other" },
};
const PERIOD: Record<BotLocale, Record<Period, string>> = {
  es: { today: "de hoy", week: "de los últimos 7 días", month: "de este mes" },
  en: { today: "today", week: "in the last 7 days", month: "this month" },
};
const PRIO: Record<BotLocale, Record<string, string>> = {
  es: { high: "alta", medium: "media", low: "baja" },
  en: { high: "high", medium: "medium", low: "low" },
};

export const bogotaToday = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" }); // YYYY-MM-DD

const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const inPeriod = (d: string, p: Period, today: string) =>
  p === "today" ? d === today : p === "month" ? d.slice(0, 7) === today.slice(0, 7) : d >= addDays(today, -6) && d <= today;

const money = (n: number, loc: BotLocale) =>
  new Intl.NumberFormat(loc === "es" ? "es-CO" : "en-US", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
const id = () => Math.random().toString(36).slice(2, 8);

export function guessCategory(note: string): Category {
  const n = norm(note);
  if (/almuerzo|cena|desayuno|comida|restaurante|mercado|super|cafe|food|lunch|dinner|breakfast|grocer/.test(n)) return "food";
  if (/taxi|uber|bus|gasolina|transporte|metro|peaje|transport|fuel|gas\b/.test(n)) return "transport";
  if (/cine|juego|ocio|fiesta|salida|netflix|leisure|movie|game|party/.test(n)) return "leisure";
  if (/farmacia|medic|salud|doctor|health|pharmacy/.test(n)) return "health";
  return "other";
}

/** Aplica la acción sobre los datos. `changed` indica si hay que guardar. */
export function execute(a: Action, d: UserData, loc: BotLocale, today: string): { text: string; changed: boolean } {
  const T = (es: string, en: string) => (loc === "es" ? es : en);
  switch (a.action) {
    case "add_expense": {
      d.expenses.push({ id: id(), amount: a.amount, category: a.category, note: a.note, date: a.date ?? today });
      const note = a.note ? ` (${a.note})` : "";
      return { changed: true, text: T(`Gasto guardado: ${money(a.amount, loc)} en ${LABEL.es[a.category]}${note}.`, `Expense saved: ${money(a.amount, loc)} in ${LABEL.en[a.category]}${note}.`) };
    }
    case "add_task": {
      d.tasks.push({ id: id(), title: a.title, due: a.due, priority: a.priority, done: false });
      const due = a.due ? T(`, vence ${a.due}`, `, due ${a.due}`) : "";
      return { changed: true, text: T(`Tarea guardada: ${a.title}${due} (prioridad ${PRIO.es[a.priority]}).`, `Task saved: ${a.title}${due} (${PRIO.en[a.priority]} priority).`) };
    }
    case "complete_task": {
      const t = d.tasks.find((x) => !x.done && norm(x.title).includes(norm(a.match)));
      if (!t) return { changed: false, text: T(`No encontré una tarea pendiente que coincida con «${a.match}».`, `I couldn't find a pending task matching "${a.match}".`) };
      t.done = true;
      return { changed: true, text: T(`Tarea completada: ${t.title}.`, `Task completed: ${t.title}.`) };
    }
    case "list_tasks": {
      const pending = d.tasks.filter((t) => !t.done);
      if (!pending.length) return { changed: false, text: T("No tienes tareas pendientes.", "You have no pending tasks.") };
      const lines = pending.slice(0, 15).map((t, i) => `${i + 1}. ${t.title}${t.due ? ` · ${t.due}` : ""} [${PRIO[loc][t.priority]}]`);
      return { changed: false, text: `${T("Tareas pendientes:", "Pending tasks:")}\n${lines.join("\n")}` };
    }
    case "add_habit": {
      d.habits.push({ habit: a.habit, date: a.date ?? today });
      return { changed: true, text: T(`Hábito registrado: ${a.habit} (${a.date ?? "hoy"}).`, `Habit logged: ${a.habit} (${a.date ?? "today"}).`) };
    }
    case "query_expenses": {
      const rows = d.expenses.filter((e) => inPeriod(e.date, a.period, today) && (!a.category || e.category === a.category));
      const cat = a.category ? ` ${T("en", "in")} ${LABEL[loc][a.category]}` : "";
      if (!rows.length) return { changed: false, text: T(`No hay gastos${cat} ${PERIOD.es[a.period]}.`, `No expenses${cat} ${PERIOD.en[a.period]}.`) };
      const total = rows.reduce((s, e) => s + e.amount, 0);
      const by = new Map<Category, number>();
      rows.forEach((e) => by.set(e.category, (by.get(e.category) ?? 0) + e.amount));
      const lines = [...by].sort((x, y) => y[1] - x[1]).map(([c, v]) => `- ${LABEL[loc][c]}: ${money(v, loc)}`);
      return { changed: false, text: `${T("Gastos", "Expenses")}${cat} ${PERIOD[loc][a.period]}: ${money(total, loc)}\n${lines.join("\n")}` };
    }
    case "query_habits": {
      const rows = d.habits.filter((h) => inPeriod(h.date, a.period, today) && (!a.habit || norm(h.habit).includes(norm(a.habit))));
      if (!rows.length) return { changed: false, text: T(`No hay hábitos registrados ${PERIOD.es[a.period]}.`, `No habits logged ${PERIOD.en[a.period]}.`) };
      const by = new Map<string, number>();
      rows.forEach((h) => by.set(h.habit, (by.get(h.habit) ?? 0) + 1));
      const lines = [...by].map(([h, n]) => `- ${h}: ${n} ${T(n === 1 ? "vez" : "veces", n === 1 ? "time" : "times")}`);
      return { changed: false, text: `${T("Hábitos", "Habits")} ${PERIOD[loc][a.period]}:\n${lines.join("\n")}` };
    }
    default:
      return { changed: false, text: "" };
  }
}
