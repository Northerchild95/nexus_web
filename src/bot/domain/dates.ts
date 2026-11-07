/** Fecha de hoy (YYYY-MM-DD) en Colombia. `now` es inyectable para poder probarla. */
export const bogotaToday = (now: Date = new Date()): string =>
  now.toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
