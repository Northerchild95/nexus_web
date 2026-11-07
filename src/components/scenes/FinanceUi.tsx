import { useFormatter, useTranslations } from "next-intl";
import Phone from "@/components/ui/Phone";

const BARS = [
  { key: "food", w: 80, c: "bg-brand-500" },
  { key: "transport", w: 45, c: "bg-brand-300" },
  { key: "leisure", w: 60, c: "bg-warning" },
  { key: "health", w: 25, c: "bg-success" },
] as const;

export default function FinanceUi() {
  const t = useTranslations("Ui.finance");
  const format = useFormatter();
  return (
    <Phone>
      <p className="text-lg font-bold">{t("title")}</p>
      <p className="mb-4 text-2xl font-bold text-brand-700">
        {format.number(482000, { style: "currency", currency: "COP", maximumFractionDigits: 0 })}
      </p>
      <div className="space-y-3">
        {BARS.map((b) => (
          <div key={b.key}>
            <div className="mb-1 flex justify-between text-[11px] font-semibold text-muted">
              <span>{t(b.key)}</span>
              <span>{format.number(b.w / 100, { style: "percent" })}</span>
            </div>
            <div className="h-3 rounded-full bg-surfaceStrong">
              <div className={`h-3 rounded-full ${b.c}`} style={{ width: `${b.w}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Phone>
  );
}
