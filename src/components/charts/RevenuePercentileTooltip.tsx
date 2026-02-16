import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/lib/utils";

interface RevenuePercentileTooltipProps {
  label: string;
  revenue: number;
  revenues: number[];
}

export function RevenuePercentileTooltip({ label, revenue, revenues }: RevenuePercentileTooltipProps) {
  const { t } = useTranslation();
  const maxR = Math.max(...revenues);
  const minR = Math.min(...revenues);
  const percentile =
    maxR === minR ? 100 : Math.round(((revenue - minR) / (maxR - minR)) * 100);

  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-sm">
        {t("chart.revenue")}: <span className="font-semibold">{formatCurrency(revenue)}</span>
      </p>
      <p className="text-xs text-muted-foreground">{t("chart.percentile")}: {percentile}%</p>
    </div>
  );
}
