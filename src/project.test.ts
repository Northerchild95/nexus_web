import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("package.json y los mensajes son JSON válido y terminan en salto de línea real", () => {
  for (const f of ["package.json", "src/messages/es.json", "src/messages/en.json"]) {
    const raw = readFileSync(f, "utf8");
    assert.doesNotThrow(() => JSON.parse(raw), `${f} no es JSON válido`);
    assert.ok(!raw.trimEnd().endsWith("\\n"), `${f} termina con un \\n literal`);
  }
});
test("el script newsletter:send existe", () => {
  const scripts = JSON.parse(readFileSync("package.json", "utf8")).scripts;
  assert.match(scripts["newsletter:send"], /newsletter-send\.ts/);
});
