const BAD = /[\s<>()[\],;:"\\]/;

/** Normaliza y valida un correo. Devuelve null si no es plausible. (La verificación real es el correo de confirmación.) */
export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length < 6 || email.length > 254) return null;
  const parts = email.split("@");
  if (parts.length !== 2) return null;
  const [local, domain] = parts;
  if (!local || local.length > 64 || BAD.test(local) || local.startsWith(".") || local.endsWith(".") || local.includes("..")) return null;
  if (!domain || BAD.test(domain) || domain.startsWith(".") || domain.endsWith(".") || domain.includes("..")) return null;
  if (!/\.[a-z]{2,}$/.test(domain)) return null;
  return email;
}

/** Oculta parte del correo para mostrarlo en pantalla sin exponerlo entero: ana.perez@gmail.com → a*******@gmail.com */
export function maskEmail(email: string): string {
  const [local = "", domain = ""] = email.split("@");
  return `${local.slice(0, 1)}${"*".repeat(Math.max(local.length - 1, 1))}@${domain}`;
}

export const isValidToken = (t: unknown): t is string => typeof t === "string" && /^[a-f0-9]{48}$/.test(t);
