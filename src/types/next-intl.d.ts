import { routing } from "@/i18n/routing";
import messages from "../messages/es.json";

// Tipa los locales y las claves de traducción: una clave inexistente falla en compilación.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
