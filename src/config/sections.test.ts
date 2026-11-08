import assert from "node:assert/strict";
import test from "node:test";
import en from "../messages/en.json";
import es from "../messages/es.json";
import { SECTIONS, visibleSections } from "./sections";

test("ids únicos", () => {
  assert.equal(new Set(SECTIONS.map((s) => s.id)).size, SECTIONS.length);
});
test("cada sección tiene etiqueta de navegación en es y en", () => {
  for (const s of SECTIONS) {
    assert.ok(s.id in es.Nav && s.id in en.Nav, `Nav.${s.id} falta`);
  }
});
test("las secciones opcionales solo aparecen si están activas", () => {
  const ids = (f: { contact: boolean; subscribe: boolean }) => visibleSections(f).map((s) => s.id);
  assert.ok(!ids({ contact: false, subscribe: false }).includes("contact"));
  assert.ok(!ids({ contact: false, subscribe: false }).includes("subscribe"));
  assert.ok(ids({ contact: true, subscribe: true }).includes("contact"));
  assert.ok(ids({ contact: true, subscribe: true }).includes("subscribe"));
});
