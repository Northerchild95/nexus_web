import assert from "node:assert/strict";
import test from "node:test";
import { execute, guessCategory } from "./actions";
import type { UserData } from "./types";

const today = "2026-11-07";
const fresh = (): UserData => ({ expenses: [], tasks: [], habits: [], lastUpdate: 0 });

test("guardar gasto cambia los datos y responde en el idioma", () => {
  const d = fresh();
  const es = execute({ action: "add_expense", amount: 18000, category: "food", note: "almuerzo" }, d, "es", today);
  assert.equal(es.changed, true);
  assert.match(es.text, /Gasto guardado/);
  assert.match(execute({ action: "add_expense", amount: 5000, category: "transport", note: "" }, d, "en", today).text, /Expense saved/);
  assert.equal(d.expenses.length, 2);
  assert.equal(d.expenses[0].date, today);
});
test("resumen de gastos respeta el periodo", () => {
  const d = fresh();
  d.expenses = [
    { id: "a", amount: 10000, category: "food", note: "", date: "2026-11-07" },
    { id: "b", amount: 20000, category: "food", note: "", date: "2026-11-02" },
    { id: "c", amount: 40000, category: "other", note: "", date: "2026-10-30" },
  ];
  assert.match(execute({ action: "query_expenses", period: "today" }, d, "es", today).text, /10\.000/);
  assert.match(execute({ action: "query_expenses", period: "month" }, d, "es", today).text, /30\.000/);
  assert.match(execute({ action: "query_expenses", period: "week" }, d, "es", today).text, /30\.000/);
  assert.match(execute({ action: "query_expenses", period: "today", category: "health" }, d, "es", today).text, /No hay gastos/);
});
test("tareas: crear, listar y completar", () => {
  const d = fresh();
  assert.match(execute({ action: "list_tasks" }, d, "es", today).text, /no tienes tareas/i);
  execute({ action: "add_task", title: "pagar internet", priority: "high" }, d, "es", today);
  assert.match(execute({ action: "list_tasks" }, d, "es", today).text, /pagar internet/);
  assert.match(execute({ action: "complete_task", match: "internet" }, d, "es", today).text, /completada/i);
  assert.equal(d.tasks[0].done, true);
  assert.equal(execute({ action: "complete_task", match: "nada" }, d, "es", today).changed, false);
});
test("hábitos: registrar y contar", () => {
  const d = fresh();
  execute({ action: "add_habit", habit: "ejercicio" }, d, "es", today);
  execute({ action: "add_habit", habit: "ejercicio" }, d, "es", today);
  assert.match(execute({ action: "query_habits", period: "week", habit: "ejercicio" }, d, "es", today).text, /ejercicio: 2 veces/);
});
test("clasificación de categorías", () => {
  assert.equal(guessCategory("almuerzo con Ana"), "food");
  assert.equal(guessCategory("uber"), "transport");
  assert.equal(guessCategory("cine"), "leisure");
  assert.equal(guessCategory("farmacia"), "health");
  assert.equal(guessCategory("regalo"), "other");
});
