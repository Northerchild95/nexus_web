// Uso: npm run bot:webhook -- https://tu-dominio.com
const base = process.argv[2];
const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_WEBHOOK_SECRET: secret } = process.env;
if (!base || !token || !secret) {
  console.error("Falta la URL o variables en .env.local. Uso: npm run bot:webhook -- https://tu-dominio.com");
  process.exit(1);
}
const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url: `${base.replace(/\/$/, "")}/api/telegram`,
    secret_token: secret,
    allowed_updates: ["message"],
  }),
});
console.log(await res.json());
