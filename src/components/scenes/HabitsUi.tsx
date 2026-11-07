import { useTranslations } from "next-intl";
import Phone from "@/components/ui/Phone";

const HABITS = [
  { key: "read", days: [1, 1, 1, 0, 1, 1, 0] },
  { key: "walk", days: [1, 0, 1, 1, 1, 0, 0] },
  { key: "meditate", days: [1, 1, 0, 1, 1, 1, 0] },
] as const;

export default function HabitsUi() {
  const t = useTranslations("Ui.habits");
  return (
    <Phone>
      <p className="mb-3 text-lg font-bold">{t("title")}</p>
      {HABITS.map((h) => (
        <div key={h.key} className="mb-3 rounded-2xl bg-card p-3 shadow-card">
          <p className="text-xs font-semibold">{t(h.key)}</p>
          <div className="mt-2 flex gap-1.5">
            {h.days.map((d, j) => (
              <span key={j} className={`h-5 w-5 rounded-md ${d ? "bg-success/80" : "bg-surfaceStrong"}`} />
            ))}
          </div>
        </div>
      ))}
      <p className="mt-2 text-center text-xs font-semibold text-muted">{t("streak", { days: 5 })}</p>
    </Phone>
  );
}
