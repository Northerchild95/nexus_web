import assert from "node:assert/strict";
import test from "node:test";
import { isValidToken, normalizeEmail } from "./email";
import { confirmationEmail } from "./templates";

test("normalizeEmail: normaliza y acepta correos válidos", () => {
  assert.equal(normalizeEmail("  Ana.Perez+nexus@Gmail.COM "), "ana.perez+nexus@gmail.com");
  assert.equal(normalizeEmail("a@b.co"), "a@b.co");
});
test("normalizeEmail: rechaza lo inválido", () => {
  for (const bad of [undefined, 42, "", "sin-arroba", "a@b", "a@@b.com", "a b@c.com", "a@b..com", ".a@b.com", "a.@b.com", "a@.com", "<x>@b.com", "a@b.c", `${"x".repeat(65)}@b.com`, `a@${"b".repeat(250)}.com`]) {
    assert.equal(normalizeEmail(bad), null, String(bad));
  }
});
test("isValidToken: 48 hex exactos", () => {
  assert.equal(isValidToken("a".repeat(48)), true);
  for (const bad of ["a".repeat(47), "g".repeat(48), "", null, 5]) assert.equal(isValidToken(bad), false);
});
test("correo de confirmación: idioma, enlaces y texto plano", () => {
  const links = { confirmUrl: "https://x.app/c?token=1&locale=es", unsubscribeUrl: "https://x.app/u?token=1" };
  const es = confirmationEmail("es", links);
  const en = confirmationEmail("en", links);
  assert.match(es.subject, /Confirma/);
  assert.match(en.subject, /Confirm/);
  assert.ok(es.html.includes("https://x.app/c?token=1&amp;locale=es")); // & escapado en HTML
  assert.ok(es.text.includes("https://x.app/c?token=1&locale=es")); // sin escapar en texto plano
  assert.ok(es.text.includes(links.unsubscribeUrl));
});
test("correo de confirmación: escapa HTML en los enlaces", () => {
  const e = confirmationEmail("es", { confirmUrl: 'https://x/"><script>', unsubscribeUrl: "https://x/u" });
  assert.ok(!e.html.includes("<script>"));
});
