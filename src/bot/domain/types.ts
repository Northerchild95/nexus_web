export const CATEGORIES = ["food", "transport", "leisure", "health", "other"] as const;
export type Category = (typeof CATEGORIES)[number];
export type Period = "today" | "week" | "month";
export type Priority = "high" | "medium" | "low";

export type Expense = { id: string; amount: number; category: Category; note: string; date: string };
export type Task = { id: string; title: string; due?: string; priority: Priority; done: boolean };
export type HabitLog = { habit: string; date: string };
export type UserData = { expenses: Expense[]; tasks: Task[]; habits: HabitLog[]; lastUpdate: number };

export type Action =
  | { action: "add_expense"; amount: number; category: Category; note: string; date?: string }
  | { action: "add_task"; title: string; due?: string; priority: Priority }
  | { action: "complete_task"; match: string }
  | { action: "list_tasks" }
  | { action: "add_habit"; habit: string; date?: string }
  | { action: "query_expenses"; period: Period; category?: Category }
  | { action: "query_habits"; period: Period; habit?: string }
  | { action: "faq" }
  | { action: "unsupported" };
