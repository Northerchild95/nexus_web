import assert from "node:assert/strict";
import test from "node:test";
import type { RateLimiter } from "../application/ports";
import { createMemoryLimiter, createUpstashLimiter, withFallback } from "./rateLimiter";

test("memoria: permite hasta el límite, bloquea y se reinicia con la ventana", async () => {
  let t = 0;
  const l = createMemoryLimiter({ limit: 2, windowMs: 1000, now: () => t });
  assert.deepEqual([await l.allow("a"), await l.allow("a"), await l.allow("a")], [true, true, false]);
  assert.equal(await l.allow("b"), true); // otra clave no se ve afectada
  t = 1000;
  assert.equal(await l.allow("a"), true);
});
test("Upstash: INCR + EXPIRE NX y bloqueo al pasar el límite", async () => {
  const cmds: unknown[][] = [];
  let n = 0;
  const fetchImpl = (async (_u: unknown, init: RequestInit) => {
    const c = JSON.parse(init.body as string); cmds.push(c);
    return new Response(JSON.stringify({ result: c[0] === "INCR" ? ++n : 1 }));
  }) as typeof fetch;
  const l = createUpstashLimiter("https://u", "t", { limit: 2, windowSec: 600, prefix: "chat:", fetchImpl });
  assert.deepEqual([await l.allow("ip"), await l.allow("ip"), await l.allow("ip")], [true, true, false]);
  assert.deepEqual(cmds[0], ["INCR", "nexus:rl:chat:ip"]);
  assert.deepEqual(cmds[1], ["EXPIRE", "nexus:rl:chat:ip", 600, "NX"]);
});
test("si Upstash falla, usa el limitador de respaldo", async () => {
  const broken: RateLimiter = { allow: async () => { throw new Error("caído"); } };
  const backup = createMemoryLimiter({ limit: 1, windowMs: 1000 });
  const l = withFallback(broken, backup);
  assert.deepEqual([await l.allow("x"), await l.allow("x")], [true, false]);
});
