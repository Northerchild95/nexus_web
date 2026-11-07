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
test("sin canales de contacto no hay enlace a #contact", () => {
  assert.ok(!visibleSections(false).some((s) => s.id === "contact"));
  assert.ok(visibleSections(true).some((s) => s.id === "contact"));
});
