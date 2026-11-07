"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Clase `dark` en <html>; respeta el tema del sistema y recuerda la elección. Evita el parpadeo en SSR.
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
