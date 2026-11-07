import type { MetadataRoute } from "next";

// Manifiesto básico: permite "añadir a pantalla de inicio". No hay service worker ni modo offline.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nexus Life",
    short_name: "Nexus",
    description: "Foco, tareas, hábitos y gastos en un solo sistema diario.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b1220",
    theme_color: "#2563eb",
    icons: [{ src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" }],
  };
}
