"use client";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useIsClient } from "@/hooks/useIsClient";

export default function ThemeSwitcher() {
  const t = useTranslations("ThemeSwitcher");
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useIsClient();
  const box = "grid h-10 w-10 place-items-center rounded-full bg-card shadow-card";

  // El tema real solo se conoce en el cliente: evitamos un icono/etiqueta incorrectos al hidratar.
  if (!hydrated) return <span className={box} aria-hidden />;

  const dark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      className={`${box} text-ink`}
      aria-label={dark ? t("toLight") : t("toDark")}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {dark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        )}
      </svg>
    </button>
  );
}
