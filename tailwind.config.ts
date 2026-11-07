import type { Config } from "tailwindcss";

// Los colores leen variables CSS (src/app/globals.css) → un solo nombre sirve para claro y oscuro.
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: v("brand-50"), 100: v("brand-100"), 200: v("brand-200"), 300: v("brand-300"),
          400: v("brand-400"), 500: v("brand-500"), 600: v("brand-600"), 700: v("brand-700"), 800: v("brand-800"),
        },
        accent: { aqua: v("accent-aqua"), mint: v("accent-mint"), amber: v("accent-amber"), rose: v("accent-rose") },
        surface: v("surface"),
        surfaceSoft: v("surface-soft"),
        surfaceStrong: v("surface-strong"),
        card: v("card"),
        frame: v("frame"),
        ink: v("ink"),
        muted: v("muted"),
        border: v("border"),
        success: v("success"),
        danger: v("danger"),
        warning: v("warning"),
      },
      boxShadow: { card: "var(--shadow-card)", lift: "var(--shadow-lift)" },
      borderRadius: { "4xl": "32px" },
      fontFamily: { sans: ["var(--font-jakarta)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
