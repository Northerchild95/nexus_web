/** Limitador de uso: true si la clave todavía puede hacer una petición en su ventana. */
export interface RateLimiter {
  allow(key: string): Promise<boolean>;
}
