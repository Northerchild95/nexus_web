import assert from "node:assert/strict";
import test from "node:test";
import { validateAction } from "./validate";

test("normaliza una acción válida del LLM", () => {
  assert.deepEqual(validateAction({ action: "add_expense", amount: "18000", category: "xyz", note: "almuerzo", date: "2026-11-07" }), {
    action: "add_expense", amount: 18000, category: "other", note: "almuerzo", date: "2026-11-07",
  });
});
test("rechaza montos inválidos y acciones desconocidas", () => {
  for (const bad of [{ action: "add_expense", amount: -5 }, { action: "add_expense", amount: "abc" }, { action: "add_expense", amount: 1e12 }, { action: "drop_db" }, null, "texto", 42]) {
    assert.equal(validateAction(bad), null);
  }
});
test("descarta fechas mal formadas y usa defaults", () => {
  const a = validateAction({ action: "add_task", title: "x", due: "mañana", priority: "urgent" });
  assert.deepEqual(a, { action: "add_task", title: "x", due: undefined, priority: "medium" });
  assert.deepEqual(validateAction({ action: "query_expenses", period: "año" }), { action: "query_expenses", period: "month", category: undefined });
});
