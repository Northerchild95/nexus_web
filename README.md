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
Flujo: comandos → FAQ por palabras clave (`src/bot/domain/knowledge.ts`) → LLM gratuito (Groq) → mensaje por defecto.
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
- El LLM solo devuelve una acción JSON; `src/bot/domain/validate.ts` la valida antes de guardar. Los datos viven en Redis bajo `nexus:user:<chatId>`.
- No incluye recordatorios (necesitan tareas programadas) ni conexión con la app móvil.

## Arquitectura y pruebas
Capas del bot (`src/bot/`), con dependencias que apuntan hacia adentro:
- `domain/`: reglas puras, sin red ni variables de entorno (tipos, comandos, validación, acciones, FAQ, idioma, fechas, base de conocimiento).
- `application/`: casos de uso (`reply.ts`) y puertos (`ports.ts`: `UserStore`, `Agent`, `Answerer`, `Deps`). Recibe sus dependencias por parámetro.
- `infrastructure/`: adaptadores reales (Upstash, Groq, Telegram) y `composition.ts`, el único lugar que lee `process.env`.
- `src/app/api/telegram/route.ts`: capa delgada que valida el secreto y delega.

Landing: textos en `src/messages`, datos visuales en `src/config`, constructores SEO puros en `src/lib/seo`, secciones en `src/components/sections`, hooks en `src/hooks`.

Pruebas (Node test runner + tsx, sin dependencias extra):

    npm test

- Cada módulo de dominio tiene su `*.test.ts` al lado.
- `reply.test.ts` prueba el caso de uso con almacén, agente y Groq falsos (reintentos, autorización, caídas).
- `infrastructure.test.ts` prueba los adaptadores con `fetch` falso.
- `messages.test.ts` falla si es/en no tienen las mismas claves.
- CI (`.github/workflows/ci.yml`): typecheck, lint, tests y build en cada push.

Depurar: los logs son una línea JSON `{"level","scope","msg"}`. En Vercel filtra por `"scope":"bot"`, `"groq"`, `"telegram"` o `"webhook"`.

## SEO y PWA
- Metadatos por idioma, `hreflang`, `viewport` con `themeColor` claro/oscuro, Open Graph (`opengraph-image.tsx`) y Twitter card.
- JSON-LD `WebSite` y `FAQPage` (generado desde los mismos textos de la FAQ).
- `sitemap.ts`, `robots.ts` (bloquea solo `/api/`), `manifest.ts` e `icon.tsx`. Es un manifiesto básico: permite añadir a pantalla de inicio, pero no hay service worker ni modo offline.

## Secciones y contacto
- Orden de la página: Hero → recorrido (World) → Cómo funciona → Funciones → Quiénes somos → Tecnología → Hitos → Opiniones → FAQ → Privacidad → Bot → Contacto (opcional).
- `src/config/sections.ts` es la fuente única de las anclas: el Header y el Footer se generan desde ahí. Un test falla si una sección no tiene etiqueta en `Nav` (es/en).
- Contacto opcional: define `NEXT_PUBLIC_CONTACT_EMAIL` y/o `NEXT_PUBLIC_GITHUB_URL`. `lib/contact.ts` valida los datos y descarta lo inválido. La sección Contacto solo aparece con 2 o más canales (Telegram cuenta); el Footer muestra los que existan.
- Textos de Tecnología y Privacidad: describen el estado real del proyecto. Revísalos si cambia (por ejemplo, cuando la app tenga política de privacidad o añadas analíticas).

## Chat embebido (bot público)
- Botón flotante en la landing → `ChatWidget` (cliente) → `POST /api/chat` → `handleChat` (`application/chat.ts`) → FAQ → IA acotada → texto por defecto.
- Solo responde preguntas públicas: no recibe el almacén de datos, así que no puede leer ni escribir datos personales.
- Protecciones: verificación de origen, tope de tamaño, mensaje máx. 300 caracteres, 20 mensajes por visitante cada 10 min y 300 consultas a la IA al día en total. Con Upstash los contadores se comparten entre instancias; sin Upstash (o si falla) se usa memoria. Ajusta los números en `createChatDeps` (`infrastructure/composition.ts`).
- Sin `GROQ_API_KEY` el chat sigue funcionando solo con la FAQ.

## FAQ animada
La duración y la curva están en `src/config/ui.ts` (`FAQ_ANIMATION_MS`, `FAQ_EASING`). Respeta `prefers-reduced-motion`.
