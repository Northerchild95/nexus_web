// Fuente de verdad del bot. Solo afirma lo que es cierto hoy; edítalo cuando cambie el producto.
export type BotLocale = "es" | "en";
type Faq = { keywords: string[]; answer: string };
type Knowledge = { welcome: string; fallback: string; faqs: Faq[] };

export const KNOWLEDGE: Record<BotLocale, Knowledge> = {
  es: {
    welcome:
      "¡Hola! Soy el asistente de Nexus Life, una app para organizar tus días: foco, tareas, hábitos y gastos. Pregúntame lo que quieras sobre la app.",
    fallback:
      "No tengo esa información todavía. Puedo contarte qué es Nexus Life, sus funciones (foco, tareas, hábitos, finanzas) o su estado de lanzamiento.",
    faqs: [
      { keywords: ["que es", "nexus", "de que trata", "para que sirve"],
        answer: "Nexus Life es una app móvil que reúne en un solo lugar tu foco diario, tus tareas, tus hábitos y tus gastos, para que diseñes tus días con claridad." },
      { keywords: ["funciones", "que hace", "caracteristicas", "incluye"],
        answer: "Tiene modo foco con temporizador y sonidos, tareas con prioridad y fecha límite, hábitos con rachas, control de gastos por categoría, y un resumen con tendencias y logros." },
      { keywords: ["foco", "temporizador", "pomodoro", "concentr"],
        answer: "El modo foco te deja elegir una tarea importante, activar un temporizador y recibir un sonido al pausar o terminar la sesión." },
      { keywords: ["tarea", "pendiente", "agenda", "prioridad"],
        answer: "Las tareas tienen prioridad (alta, media o baja), estado y fecha límite. Tu agenda del día se arma con ellas." },
      { keywords: ["habito", "racha", "rutina"],
        answer: "Los hábitos pueden ser diarios, semanales o mensuales, y ves tu progreso y tu racha actual." },
      { keywords: ["gasto", "finanza", "dinero", "presupuesto"],
        answer: "En finanzas registras gastos rápido y los ves por categoría, con gráficas, para saber en qué se va tu dinero." },
      { keywords: ["precio", "costo", "cuesta", "gratis", "pagar"],
        answer: "Todavía no hay información de precios; la app sigue en desarrollo." },
      { keywords: ["cuando", "lanzamiento", "disponible", "descargar", "ios", "android", "tienda", "salir"],
        answer: "Nexus Life sigue en desarrollo y aún no hay fecha de lanzamiento ni enlaces de descarga." },
    ],
  },
  en: {
    welcome:
      "Hi! I'm the Nexus Life assistant. Nexus Life is an app to organize your days: focus, tasks, habits and spending. Ask me anything about it.",
    fallback:
      "I don't have that information yet. I can tell you what Nexus Life is, its features (focus, tasks, habits, finance) or its release status.",
    faqs: [
      { keywords: ["what is", "nexus", "about", "what's it for"],
        answer: "Nexus Life is a mobile app that brings your daily focus, tasks, habits and spending into one place, so you can design your days with clarity." },
      { keywords: ["features", "what does", "includes", "what can"],
        answer: "It has a focus mode with a timer and sounds, tasks with priority and due dates, habits with streaks, spending tracking by category, and a summary with trends and achievements." },
      { keywords: ["focus", "timer", "pomodoro", "concentrat"],
        answer: "Focus mode lets you pick an important task, start a timer and get a sound when you pause or finish the session." },
      { keywords: ["task", "to-do", "todo", "agenda", "priority"],
        answer: "Tasks have a priority (high, medium or low), a status and a due date. Your daily agenda is built from them." },
      { keywords: ["habit", "streak", "routine"],
        answer: "Habits can be daily, weekly or monthly, and you see your progress and current streak." },
      { keywords: ["spending", "expense", "finance", "money", "budget"],
        answer: "In finance you log expenses quickly and see them by category, with charts, to know where your money goes." },
      { keywords: ["price", "cost", "free", "pay", "pricing"],
        answer: "There's no pricing information yet; the app is still in development." },
      { keywords: ["when", "release", "available", "download", "ios", "android", "store", "launch"],
        answer: "Nexus Life is still in development, with no release date or download links yet." },
    ],
  },
};
