import assert from "node:assert/strict";
import test from "node:test";
import { parseArgs } from "./cliArgs";

const ok = (argv: string[]) => { const r = parseArgs(argv); assert.ok(r.ok, JSON.stringify(r)); return (r as { args: ReturnType<typeof parseArgs> extends infer T ? never : never } & { args: Record<string, unknown> }).args; };
const err = (argv: string[]) => { const r = parseArgs(argv); assert.equal(r.ok, false); return (r as { error: string }).error; };
const base = ["--campaign", "launch", "--site", "https://nexus.app"];

test("valores por defecto: simulación, 100 por ejecución y botón al sitio", () => {
  const a = ok(base);
  assert.deepEqual([a.campaign, a.site, a.ctaUrl, a.limit, a.send], ["launch", "https://nexus.app", "https://nexus.app", 100, false]);
});
test("acepta --clave=valor, quita la barra final y lee --send y --cta", () => {
  const a = ok(["--campaign=update", "--site=https://nexus.app/", "--cta", "https://play.google.com/x", "--limit=20", "--send"]);
  assert.deepEqual([a.campaign, a.site, a.ctaUrl, a.limit, a.send], ["update", "https://nexus.app", "https://play.google.com/x", 20, true]);
});
test("--test valida el correo y no se mezcla con --send", () => {
  assert.equal(ok([...base, "--test", "Yo@Mail.com", "--locale", "en"]).testTo, "yo@mail.com");
  assert.match(err([...base, "--test", "nope"]), /correo válido/);
  assert.match(err([...base, "--test", "a@b.co", "--send"]), /no los dos/);
});
test("rechaza entradas peligrosas o incompletas", () => {
  assert.match(err(["--site", "https://nexus.app"]), /--campaign/);
  assert.match(err(["--campaign", "spam", "--site", "https://nexus.app"]), /--campaign/);
  assert.match(err(["--campaign", "launch"]), /--site/);
  assert.match(err(["--campaign", "launch", "--site", "http://sitio-sin-https.com"]), /--site/);
  assert.match(err([...base, "--limit", "0"]), /--limit/);
  assert.match(err([...base, "--limit", "999"]), /--limit/);
  assert.match(err([...base, "--cta", "javascript:alert(1)"]), /--cta/);
  assert.match(err([...base, "--limit"]), /Falta el valor/);
  assert.match(err(["launch"]), /inesperado/);
});
test("permite localhost sin https para pruebas locales", () => {
  assert.ok(parseArgs(["--campaign", "launch", "--site", "http://localhost:3000"]).ok);
});
