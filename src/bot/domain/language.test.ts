import assert from "node:assert/strict";
import test from "node:test";
import { bogotaToday } from "./dates";
import { pickLocale } from "./detect";
import { matchFaq } from "./faq";
import { KNOWLEDGE } from "./knowledge";
import { parseCommand } from "./commands";

test("FAQ por palabras clave en ambos idiomas", () => {
  assert.match(matchFaq("¿Cuánto cuesta?", "es") ?? "", /precios/);
  assert.match(matchFaq("what's the price", "en") ?? "", /pricing/);
  assert.equal(matchFaq("xyzzy", "es"), null);
});
test("cada botón del menú público lleva a una respuesta", () => {
  for (const loc of ["es", "en"] as const) {
    for (const label of KNOWLEDGE[loc].menu) assert.ok(matchFaq(label, loc), `${loc}: "${label}" sin respuesta`);
  }
});
test("cada botón del menú personal es FAQ o comando", () => {
  for (const loc of ["es", "en"] as const) {
    for (const label of KNOWLEDGE[loc].menuPersonal) {
      assert.ok(matchFaq(label, loc) || parseCommand(label), `${loc}: "${label}" no hace nada`);
    }
  }
});
test("detección de idioma por el texto", () => {
  assert.equal(pickLocale("¿Qué es Nexus Life?", "en"), "es");
  assert.equal(pickLocale("what is this app", "es"), "en");
  assert.equal(pickLocale("Habits", "es"), "en");
  assert.equal(pickLocale("???", "en"), "en");
  assert.equal(pickLocale("???", undefined), "es");
});
test("fecha de Bogotá respeta la zona horaria", () => {
  assert.equal(bogotaToday(new Date("2026-11-08T03:30:00Z")), "2026-11-07"); // 22:30 en Bogotá
  assert.equal(bogotaToday(new Date("2026-11-08T05:30:00Z")), "2026-11-08");
});
