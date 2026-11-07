import assert from "node:assert/strict";
import test from "node:test";
import { buildContactChannels, linkAttrs } from "./contact";

test("arma los canales válidos en orden", () => {
  const ids = buildContactChannels({ telegram: "@nexus95bot", email: "hola@nexus.app", github: "https://github.com/Northerchild95/nexus_web" }).map((c) => c.id);
  assert.deepEqual(ids, ["telegram", "email", "github"]);
});
test("el usuario de Telegram acepta @ y genera el enlace", () => {
  assert.equal(buildContactChannels({ telegram: "@nexus95bot" })[0].href, "https://t.me/nexus95bot");
});
test("descarta datos inválidos o inseguros", () => {
  assert.deepEqual(buildContactChannels({ telegram: "a b", email: "no-es-correo", github: "javascript:alert(1)" }), []);
  assert.deepEqual(buildContactChannels({ github: "https://evil.com/github.com/x" }), []);
});
test("mailto no abre pestaña nueva; el resto sí con noopener", () => {
  const [tg, mail] = buildContactChannels({ telegram: "nexus95bot", email: "a@b.co" });
  assert.deepEqual(linkAttrs(mail), {});
  assert.equal(linkAttrs(tg).rel, "noopener noreferrer");
});
test("sin datos no hay canales", () => {
  assert.deepEqual(buildContactChannels({}), []);
});
