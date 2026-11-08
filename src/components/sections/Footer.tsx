import { useTranslations } from "next-intl";
import { contactChannels, showContactSection } from "@/config/contact";
import { visibleSections } from "@/config/sections";
import { subscribeEnabled } from "@/config/subscribe";
import { linkAttrs } from "@/lib/contact";

export default function Footer() {
  const t = useTranslations("Footer");
  const nav = useTranslations("Nav");
  const contact = useTranslations("Contact");
  const sections = visibleSections({ contact: showContactSection, subscribe: subscribeEnabled });
  const columns = [
    { key: "product", links: sections.filter((s) => s.column === "product") },
    { key: "project", links: sections.filter((s) => s.column === "project") },
  ] as const;

  return (
    <footer className="border-t border-border px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-4">
        <div>
          <p className="text-xl font-bold tracking-tight">Nexus Life</p>
          <p className="mt-3 leading-7 text-muted">{t("title")}</p>
        </div>
        {columns.map((col) => (
          <nav key={col.key} aria-label={t(col.key)}>
            <h2 className="font-bold">{t(col.key)}</h2>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((s) => (
                <li key={s.id}><a href={`#${s.id}`} className="text-muted hover:text-ink">{nav(s.id)}</a></li>
              ))}
            </ul>
          </nav>
        ))}
        {contactChannels.length > 0 && (
          <nav aria-label={t("contact")}>
            <h2 className="font-bold">{t("contact")}</h2>
            <ul className="mt-4 space-y-2.5">
              {contactChannels.map((c) => (
                <li key={c.id}>
                  <a href={c.href} {...linkAttrs(c)} className="text-muted hover:text-ink">
                    {contact(`${c.id}.label`)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      <div className="mx-auto mt-14 flex max-w-6xl flex-wrap justify-between gap-2 border-t border-border pt-6 text-sm text-muted">
        <p>{t("copyright", { year: String(new Date().getFullYear()) })}</p>
        <p>{t("note")}</p>
      </div>
    </footer>
  );
}
