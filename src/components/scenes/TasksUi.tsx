import { useTranslations } from "next-intl";
import Phone from "@/components/ui/Phone";

const ROWS = [
  { key: "invoice", p: "high", bg: "bg-accent-rose" },
  { key: "design", p: "medium", bg: "bg-accent-amber" },
  { key: "gift", p: "low", bg: "bg-accent-mint" },
  { key: "bank", p: "medium", bg: "bg-accent-amber" },
] as const;

export default function TasksUi() {
  const t = useTranslations("Ui.tasks");
  return (
    <Phone>
      <p className="mb-3 text-lg font-bold">{t("title")}</p>
      <div className="space-y-2">
        {ROWS.map((r) => (
          <div key={r.key} className="flex items-center gap-2 rounded-2xl bg-card p-3 shadow-card">
            <span className="h-4 w-4 rounded-full border-2 border-brand-400" />
            <span className="flex-1 text-xs font-semibold">{t(r.key)}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${r.bg}`}>{t(r.p)}</span>
          </div>
        ))}
      </div>
    </Phone>
  );
}
