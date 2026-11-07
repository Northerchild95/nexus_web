import assert from "node:assert/strict";
import test from "node:test";
import en from "./messages/en.json";
import es from "./messages/es.json";

const flatten = (o: unknown, prefix = ""): string[] =>
  typeof o === "object" && o !== null
    ? Object.entries(o).flatMap(([k, v]) => flatten(v, prefix ? `${prefix}.${k}` : k))
    : [prefix];
const leaves = (o: unknown, prefix = ""): [string, unknown][] =>
  typeof o === "object" && o !== null
    ? Object.entries(o).flatMap(([k, v]) => leaves(v, prefix ? `${prefix}.${k}` : k))
    : [[prefix, o]];

test("es y en tienen exactamente las mismas claves", () => {
  const a = new Set(flatten(es)), b = new Set(flatten(en));
  assert.deepEqual([...a].filter((k) => !b.has(k)), [], "faltan en en.json");
  assert.deepEqual([...b].filter((k) => !a.has(k)), [], "faltan en es.json");
});
test("ninguna traducción está vacía", () => {
  for (const [name, m] of [["es", es], ["en", en]] as const) {
    for (const [k, v] of leaves(m)) assert.ok(typeof v === "string" && v.trim(), `${name}: ${k} vacía`);
  }
});
