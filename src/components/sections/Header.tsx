import { useTranslations } from "next-intl";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";

const LINKS = ["features", "about", "milestones", "opinions"] as const;

export default function Header() {
  const t = useTranslations("Nav");
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-3 px-4 py-4">
      <a href="#top" className="pointer-events-auto rounded-full bg-card px-4 py-2 text-sm font-bold shadow-card">
        Nexus Life
      </a>
      <nav aria-label={t("label")} className="pointer-events-auto hidden rounded-full bg-card p-1 shadow-card md:flex">
        {LINKS.map((l) => (
          <a key={l} href={`#${l}`} className="rounded-full px-4 py-1.5 text-sm font-semibold text-muted hover:text-ink">
            {t(l)}
          </a>
        ))}
      </nav>
      <div className="pointer-events-auto flex items-center gap-2">
        <ThemeSwitcher />
        <LocaleSwitcher />
      </div>
    </header>
  );
}
