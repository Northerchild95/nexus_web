import assert from "node:assert/strict";
import test from "node:test";
import { parseCommand } from "./commands";

test("gasto con monto simple", () => {
  assert.deepEqual(parseCommand("gasto 18000 almuerzo"), { action: "add_expense", amount: 18000, category: "food", note: "almuerzo" });
});
test("entiende '18 mil', '18k' y separador de miles", () => {
  assert.equal((parseCommand("gasté 18 mil en almuerzo") as { amount: number }).amount, 18000);
  assert.equal((parseCommand("gasté 18k en taxi") as { amount: number }).amount, 18000);
  assert.equal((parseCommand("gasto 5.500 taxi") as { amount: number }).amount, 5500);
});
test("monto inválido no es comando", () => {
  assert.equal(parseCommand("gasto abc"), null);
});
test("tareas, hábitos y consultas", () => {
  assert.deepEqual(parseCommand("tarea pagar internet"), { action: "add_task", title: "pagar internet", priority: "medium" });
  assert.deepEqual(parseCommand("habito ejercicio"), { action: "add_habit", habit: "ejercicio" });
  assert.deepEqual(parseCommand("hecho internet"), { action: "complete_task", match: "internet" });
  for (const t of ["mis tareas", "My tasks", "/tareas"]) assert.deepEqual(parseCommand(t), { action: "list_tasks" });
  for (const t of ["mis gastos", "My expenses"]) assert.deepEqual(parseCommand(t), { action: "query_expenses", period: "month" });
});
test("texto normal no es comando", () => {
  assert.equal(parseCommand("hola, ¿qué es Nexus?"), null);
});
