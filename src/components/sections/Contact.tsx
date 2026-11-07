import { useTranslations } from "next-intl";
import SectionHeader from "@/components/ui/SectionHeader";
import { contactChannels } from "@/config/contact";
import { linkAttrs } from "@/lib/contact";

export default function Contact() {
  const t = useTranslations("Contact");
  return (
    <section id="contact" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <SectionHeader title={t("title")} lead={t("lead")} />
      <ul className="mt-12 max-w-3xl divide-y divide-border border-y border-border">
        {contactChannels.map((c) => (
          <li key={c.id}>
            <a
              href={c.href}
              {...linkAttrs(c)}
              className="group flex items-center justify-between gap-4 py-6"
            >
              <span>
                <span className="block text-2xl font-bold tracking-tight">{t(`${c.id}.label`)}</span>
                <span className="mt-1 block text-muted">{t(`${c.id}.text`)}</span>
              </span>
              <span aria-hidden className="text-3xl text-brand-500 transition-transform group-hover:translate-x-1">→</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
