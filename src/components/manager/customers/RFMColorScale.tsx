import { useTranslation } from "react-i18next";

export function RFMColorScale() {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-sm font-semibold">{t("rfm.colorScale")}</span>
        <div className="flex-1 flex items-center gap-2 min-w-[200px]">
          <div
            className="w-6 h-6 rounded border shrink-0"
            style={{ backgroundColor: "var(--chart-2)" }}
          />
          <div
            className="h-4 flex-1 rounded-full border overflow-hidden"
            style={{
              background:
                "linear-gradient(to right, var(--chart-2), var(--chart-3) 30%, var(--chart-3) 50%, var(--chart-8) 70%, var(--chart-5))",
            }}
          />
          <div
            className="w-6 h-6 rounded border shrink-0"
            style={{ backgroundColor: "var(--chart-5)" }}
          />
        </div>
        <span className="text-xs text-muted-foreground">{t("rfm.highToLow")}</span>
      </div>
    </div>
  );
}
