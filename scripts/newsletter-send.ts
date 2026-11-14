/**
 * Envía una campaña a los suscriptores confirmados.
 *
 *   npm run newsletter:send -- --campaign launch --site https://tu-sitio.vercel.app            (simulación)
 *   npm run newsletter:send -- --campaign launch --site https://tu-sitio.vercel.app --test tu@correo.com
 *   npm run newsletter:send -- --campaign launch --site https://tu-sitio.vercel.app --send     (envío real)
 *
 * Capa delgada: solo lee argumentos y entorno, pregunta y muestra resultados. La lógica está en src/newsletter/.
 */
import { createInterface } from "node:readline/promises";
import { runBroadcast, planBroadcast } from "../src/newsletter/application/broadcast";
import { maskEmail } from "../src/newsletter/domain/email";
import { campaignEmail } from "../src/newsletter/domain/templates";
import { createCampaignLedger } from "../src/newsletter/infrastructure/campaignLedger";
import { parseArgs } from "../src/newsletter/infrastructure/cliArgs";
import { createSubscribeDeps } from "../src/newsletter/infrastructure/composition";

const fail = (msg: string): never => {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
};

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (!parsed.ok) fail(parsed.error);
  const { args } = parsed as Extract<typeof parsed, { ok: true }>;

  const deps = createSubscribeDeps(process.env);
  const { UPSTASH_REDIS_REST_URL: url, UPSTASH_REDIS_REST_TOKEN: token } = process.env;
  if (!deps || !url || !token) fail("Falta configuración en .env.local: UPSTASH_REDIS_REST_*, EMAIL_FROM y BREVO_API_KEY (o RESEND_API_KEY).");
  const { store, mailer } = deps!;
  const ledger = createCampaignLedger(url!, token!);

  // --test: un solo correo de prueba, para ver el diseño. No toca el registro de envíos.
  if (args.testTo) {
    const unsubscribeUrl = `${args.site}/api/subscribe/unsubscribe?token=${"0".repeat(48)}&locale=${args.locale}`;
    const content = campaignEmail(args.campaign, args.locale, { buttonUrl: args.ctaUrl, unsubscribeUrl });
    await mailer({ to: args.testTo, ...content, unsubscribeUrl });
    console.log(`✔ Correo de prueba enviado a ${maskEmail(args.testTo)} (el enlace de baja de la prueba no funciona).`);
    return;
  }

  const plan = await planBroadcast({ campaign: args.campaign, limit: args.limit }, { store, ledger });
  console.log(`\nCampaña: ${args.campaign}   Sitio: ${args.site}   Botón → ${args.ctaUrl}`);
  console.log(`Confirmados: ${plan.totalConfirmed}   Ya recibieron: ${plan.alreadySent}   Se enviarán ahora: ${plan.recipients.length}   Quedarán pendientes: ${plan.remainingAfter}`);
  plan.recipients.slice(0, 5).forEach((s) => console.log(`  · ${maskEmail(s.email)} (${s.locale})`));
  if (plan.recipients.length > 5) console.log(`  · … y ${plan.recipients.length - 5} más`);

  if (plan.recipients.length === 0) return console.log("\nNada que enviar.\n");
  if (!args.send) return console.log("\nSIMULACIÓN: no se envió nada. Añade --send para enviar de verdad.\n");

  console.log("\nOjo: tu plan gratuito tiene un tope diario de correos (revísalo en tu proveedor) y comparte cupo con los correos de confirmación.");
  if (!process.stdin.isTTY) fail("El envío real necesita una terminal interactiva para pedir confirmación.");
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await rl.question(`Escribe ENVIAR ${plan.recipients.length} para confirmar: `)).trim();
  rl.close();
  if (answer !== `ENVIAR ${plan.recipients.length}`) fail("Confirmación incorrecta: no se envió nada.");

  const report = await runBroadcast(
    plan.recipients,
    { campaign: args.campaign, site: args.site, ctaUrl: args.ctaUrl, delayMs: 300, maxConsecutiveFailures: 3 },
    { mailer, ledger, sleep: (ms) => new Promise((r) => setTimeout(r, ms)) },
    (done, total, email, ok) => console.log(`  [${done}/${total}] ${ok ? "✔" : "✖"} ${maskEmail(email)}`),
  );

  console.log(`\nEnviados: ${report.sent}   Fallidos: ${report.failed}${report.aborted ? "   (DETENIDO por fallos seguidos)" : ""}`);
  report.failures.slice(0, 3).forEach((f) => console.log(`  ✖ ${maskEmail(f.email)}: ${f.error}`));
  if (report.failed > 0) process.exit(1);
}

main().catch((e) => fail(e instanceof Error ? e.message : String(e)));
