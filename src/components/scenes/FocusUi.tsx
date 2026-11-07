import { useTranslations } from "next-intl";
import Phone from "@/components/ui/Phone";

export default function FocusUi() {
  const t = useTranslations("Ui.focus");
  const r = 62;
  const c = 2 * Math.PI * r;
  return (
    <Phone>
      <p className="text-sm font-semibold text-muted">{t("label")}</p>
      <p className="text-lg font-bold">{t("task")}</p>
      <div className="relative mx-auto mt-6 h-40 w-40">
        <svg viewBox="0 0 160 160" className="h-40 w-40 -rotate-90">
          <circle cx="80" cy="80" r={r} fill="none" className="stroke-surfaceStrong" strokeWidth="12" />
          <circle cx="80" cy="80" r={r} fill="none" className="stroke-brand-500" strokeWidth="12"
            strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * 0.35} />
        </svg>
        <p className="absolute inset-0 grid place-items-center text-3xl font-bold">16:12</p>
      </div>
      <div className="mt-8 rounded-2xl bg-brand-600 py-3 text-center text-sm font-semibold text-white">
        {t("pause")}
      </div>
    </Phone>
  );
}
