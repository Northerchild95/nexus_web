import { useTranslations } from "next-intl";
import Phone from "@/components/ui/Phone";

const WEEK = [40, 65, 50, 80, 70, 95, 60];

export default function InsightsUi() {
  const t = useTranslations("Ui.insights");
  return (
    <Phone>
      <p className="text-lg font-bold">{t("title")}</p>
      <div className="mt-6 flex h-36 items-end gap-2">
        {WEEK.map((h, i) => (
          <span key={i} className="flex-1 rounded-t-lg bg-brand-500" style={{ height: `${h}%`, opacity: 0.45 + h / 180 }} />
        ))}
      </div>
      <div className="mt-6 rounded-2xl bg-card p-3 shadow-card">
        <p className="text-[11px] font-semibold text-muted">{t("badge")}</p>
        <p className="text-sm font-bold">{t("streak")}</p>
      </div>
    </Phone>
  );
}
