type Level = "info" | "warn" | "error";

/** Logs en una línea JSON: fáciles de filtrar en Vercel (busca por scope o level). */
export function createLogger(scope: string) {
  const emit = (level: Level, msg: string, extra?: unknown) => {
    const detail = extra instanceof Error ? { error: extra.message } : extra !== undefined ? { extra } : {};
    (level === "error" ? console.error : console.log)(JSON.stringify({ level, scope, msg, ...detail }));
  };
  return {
    info: (msg: string, extra?: unknown) => emit("info", msg, extra),
    warn: (msg: string, extra?: unknown) => emit("warn", msg, extra),
    error: (msg: string, extra?: unknown) => emit("error", msg, extra),
  };
}
export type Logger = ReturnType<typeof createLogger>;
