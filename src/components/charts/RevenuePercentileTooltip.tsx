import { formatCurrency } from "@/lib/utils";

interface RevenuePercentileTooltipProps {
  label: string;
  revenue: number;
  revenues: number[];
}

export function RevenuePercentileTooltip({ label, revenue, revenues }: RevenuePercentileTooltipProps) {
  const maxR = Math.max(...revenues);
  const minR = Math.min(...revenues);
  const percentile =
    maxR === minR ? 100 : Math.round(((revenue - minR) / (maxR - minR)) * 100);

  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-sm">
        Revenue: <span className="font-semibold">{formatCurrency(revenue)}</span>
      </p>
      <p className="text-xs text-muted-foreground">Percentile: {percentile}%</p>
    </div>
  );
}
