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

import { CAMPAIGN_IDS, isCampaignId } from "./campaigns";
import { maskEmail } from "./email";
import { campaignEmail } from "./templates";

test("maskEmail oculta el usuario sin perder el dominio", () => {
  assert.equal(maskEmail("ana.perez@gmail.com"), "a********@gmail.com");
  assert.equal(maskEmail("a@b.co"), "a*@b.co");
});
test("campañas: ids válidos", () => {
  assert.ok(CAMPAIGN_IDS.includes("launch") && isCampaignId("update"));
  assert.equal(isCampaignId("spam"), false);
  assert.equal(isCampaignId(5), false);
});
test("campaignEmail: cada campaña e idioma tiene asunto, botón y enlace de baja", () => {
  for (const id of CAMPAIGN_IDS) {
    for (const loc of ["es", "en"] as const) {
      const e = campaignEmail(id, loc, { buttonUrl: "https://x/app", unsubscribeUrl: "https://x/u?a=1&b=2" });
      assert.ok(e.subject.length > 3);
      assert.ok(e.html.includes("https://x/app") && e.text.includes("https://x/app"));
      assert.ok(e.html.includes("https://x/u?a=1&amp;b=2") && e.text.includes("https://x/u?a=1&b=2"));
    }
  }
});
test("campaignEmail: escapa HTML en los textos y enlaces", () => {
  const e = campaignEmail("launch", "es", { buttonUrl: 'https://x/"><script>alert(1)</script>', unsubscribeUrl: "https://x/u" });
  assert.ok(!e.html.includes("<script>"));
});
