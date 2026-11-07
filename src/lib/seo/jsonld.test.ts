import assert from "node:assert/strict";
import test from "node:test";
import { buildFaqJsonLd, buildWebSiteJsonLd, serializeJsonLd } from "./jsonld";

test("FAQPage tiene una pregunta por item", () => {
  const j = buildFaqJsonLd([{ q: "¿A?", a: "B" }, { q: "¿C?", a: "D" }]);
  assert.equal(j["@type"], "FAQPage");
  assert.equal(j.mainEntity.length, 2);
  assert.equal(j.mainEntity[0].acceptedAnswer.text, "B");
});
test("WebSite incluye idioma", () => {
  assert.equal(buildWebSiteJsonLd("N", "https://x", "es").inLanguage, "es");
});
test("serialize escapa </script>", () => {
  assert.ok(!serializeJsonLd({ a: "</script><b>" }).includes("</script>"));
});
