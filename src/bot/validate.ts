import { CATEGORIES, type Action, type Category, type Period } from "./types";

const str = (v: unknown, max = 120) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;
const date = (v: unknown) =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) ? v : undefined;
const category = (v: unknown): Category =>
  CATEGORIES.includes(v as Category) ? (v as Category) : "other";
const period = (v: unknown): Period => (v === "today" || v === "week" ? v : "month");

export function validateAction(raw: unknown): Action | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  switch (o.action) {
    case "add_expense": {
      const amount = Number(o.amount);
      if (!Number.isFinite(amount) || amount <= 0 || amount > 1e10) return null;
      return { action: "add_expense", amount: Math.round(amount), category: category(o.category), note: str(o.note) ?? "", date: date(o.date) };
    }
    case "add_task": {
      const title = str(o.title);
      if (!title) return null;
      const p = o.priority;
      return { action: "add_task", title, due: date(o.due), priority: p === "high" || p === "low" ? p : "medium" };
    }
    case "complete_task": {
      const match = str(o.match);
      return match ? { action: "complete_task", match } : null;
    }
    case "list_tasks":
      return { action: "list_tasks" };
    case "add_habit": {
      const habit = str(o.habit, 60);
      return habit ? { action: "add_habit", habit, date: date(o.date) } : null;
    }
    case "query_expenses":
      return { action: "query_expenses", period: period(o.period), category: o.category ? category(o.category) : undefined };
    case "query_habits":
      return { action: "query_habits", period: period(o.period), habit: str(o.habit, 60) ?? undefined };
    case "faq":
      return { action: "faq" };
    case "unsupported":
      return { action: "unsupported" };
    default:
      return null;
  }
}
