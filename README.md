# Nexus Landing

Landing con vuelo de cámara por scroll, bilingüe (es/en), SSR/estática por idioma.

    cp .env.example .env.local
    npm install
    npm run dev        # http://localhost:3000 → redirige a /es
    npm run typecheck && npm run lint && npm run build

## Arquitectura
- `src/i18n/`: routing (es por defecto, prefijo `/es` `/en`), request config, navegación tipada. `src/middleware.ts` resuelve el idioma.
- `src/messages/*.json`: todos los textos. Las claves están tipadas (`src/types/next-intl.d.ts`, basado en es.json).
- `src/app/[locale]/`: layout (metadata, hreflang, `lang`), page estática (`generateStaticParams` + `setRequestLocale`). `sitemap.ts` y `robots.ts` en `src/app/`.
- `src/components/sections|scenes|ui`: Server Components (traducen en el servidor).
- `src/components/world/`: `WorldSection` (servidor) traduce y pasa props a `World` (isla de cliente con GSAP).
- `src/hooks/`: `useMediaQuery`, `useReducedMotion`, `useIsClient`, `useSmoothScroll`, `useWorldTimeline`.
- `src/config/scenes.ts`: posiciones/colores de escenas; los textos viven en los mensajes.

## Añadir un idioma
1. Agregar el código en `src/i18n/routing.ts`. 2. Crear `src/messages/<código>.json` con las mismas claves. 3. Añadirlo a `LocaleSwitcher` en ambos JSON.

## Añadir una escena
Entrada en `SCENES`, componente `XxxUi` en `components/scenes`, mapearlo en `WorldSection`, y textos en `Scenes.<id>` de cada JSON.

## Tema claro/oscuro
- `next-themes` pone la clase `dark` en `<html>` (sistema por defecto + botón en el Header).
- Los colores son variables CSS (`src/app/globals.css`, bloques `:root` y `.dark`) leídas por `tailwind.config.ts`. Para cambiar la paleta oscura, edita solo `.dark`.
- Usa `bg-card` (no `bg-white`) y los tokens `ink`, `muted`, `surface*`; evita colores hex fijos.

## Bot de Telegram (gratis)
Flujo: comandos → FAQ por palabras clave (`src/bot/knowledge.ts`) → LLM gratuito (Groq) → mensaje por defecto.
1. En Telegram, habla con **@BotFather** → `/newbot` → copia el token.
2. `cp .env.example .env.local` y rellena `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET` (cualquier texto aleatorio con letras/números/_/-), `GROQ_API_KEY` y `NEXT_PUBLIC_TELEGRAM_BOT` (usuario del bot sin @).
3. Publica la web (p. ej. Vercel) con esas variables en el panel de entorno. Telegram exige una URL HTTPS pública.
4. Registra el webhook: `npm run bot:webhook -- https://tu-dominio.com`
5. Escríbele al bot. Para probar en local necesitas un túnel HTTPS (cloudflared o ngrok) y usar esa URL en el paso 4.
Los secretos nunca van en código ni en variables `NEXT_PUBLIC_*` (salvo el usuario público del bot).

## Bot personal (gastos, tareas, hábitos)
Para chats autorizados (`TELEGRAM_ALLOWED_CHAT_IDS`) y con Upstash configurado:
- Comandos fijos, sin IA: `gasto 18000 almuerzo`, `tarea pagar internet`, `hecho internet`, `habito ejercicio`, `mis tareas`, `mis gastos`.
- Texto libre (requiere `GROQ_API_KEY`): "gasté 18 mil en almuerzo", "recuérdame..." (no soportado aún), "¿cuánto llevo en comida este mes?".
- El LLM solo devuelve una acción JSON; `src/bot/validate.ts` la valida antes de guardar. Los datos viven en Redis bajo `nexus:user:<chatId>`.
- No incluye recordatorios (necesitan tareas programadas) ni conexión con la app móvil.
