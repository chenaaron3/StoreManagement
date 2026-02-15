import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RFMMatrixCell } from "@/types/analysis";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("ja-JP").format(value);
}

type MetricType = "revenue" | "aov" | "customers";

interface RFMAnalysisProps {
  rfmMatrix: RFMMatrixCell[];
}

const RECENCY_LABELS: { value: number; label: string }[] = [
  { value: 4, label: "Most recent" },
  { value: 3, label: "Recent" },
  { value: 2, label: "Less recent" },
  { value: 1, label: "Least recent" },
];

const FREQUENCY_LABELS: { value: number; label: string }[] = [
  { value: 4, label: "High" },
  { value: 3, label: "Medium-high" },
  { value: 2, label: "Medium-low" },
  { value: 1, label: "Low" },
];

export function RFMAnalysis({ rfmMatrix }: RFMAnalysisProps) {
  const [metricType, setMetricType] = useState<MetricType>("revenue");

  const cellDataMap = new Map<string, RFMMatrixCell>();
  rfmMatrix.forEach((cell) => {
    cellDataMap.set(`${cell.rScore}-${cell.fScore}`, cell);
  });

  const recencyRanges: Record<number, { min: number; max: number }> = {};
  const frequencyRanges: Record<number, { min: number; max: number }> = {};
  rfmMatrix.forEach((cell) => {
    if (cell.recencyRange) recencyRanges[cell.rScore] = cell.recencyRange;
    if (cell.frequencyRange) frequencyRanges[cell.fScore] = cell.frequencyRange;
  });

  const getMetricValue = (cell: RFMMatrixCell | undefined): number => {
    if (!cell || cell.count === 0) return 0;
    switch (metricType) {
      case "revenue":
        return cell.totalRevenue;
      case "aov":
        return cell.averageRevenue;
      case "customers":
        return cell.count;
      default:
        return 0;
    }
  };

  const metricValues = rfmMatrix.map((cell) => getMetricValue(cell)).filter((v) => v > 0);
  const minValue = metricValues.length > 0 ? Math.min(...metricValues) : 0;
  const maxValue = metricValues.length > 0 ? Math.max(...metricValues) : 0;
  const valueRange = maxValue - minValue;

  const getColorIntensity = (value: number): string => {
    if (value === 0) return "bg-muted";
    const intensity = valueRange > 0 ? (value - minValue) / valueRange : 0.5;
    if (intensity >= 0.9) return "bg-green-600";
    if (intensity >= 0.8) return "bg-green-500";
    if (intensity >= 0.7) return "bg-green-400";
    if (intensity >= 0.6) return "bg-lime-400";
    if (intensity >= 0.5) return "bg-yellow-400";
    if (intensity >= 0.4) return "bg-amber-400";
    if (intensity >= 0.3) return "bg-orange-400";
    if (intensity >= 0.2) return "bg-orange-500";
    if (intensity >= 0.1) return "bg-red-400";
    return "bg-red-500";
  };

  const getDisplayValue = (cell: RFMMatrixCell | undefined): string => {
    if (!cell || cell.count === 0) return "—";
    switch (metricType) {
      case "revenue":
        return `¥${(cell.totalRevenue / 1000000).toFixed(1)}M`;
      case "aov":
        return formatCurrency(cell.averageRevenue);
      case "customers":
        return formatNumber(cell.count);
      default:
        return "";
    }
  };

  const getTooltipText = (cell: RFMMatrixCell | undefined): string => {
    if (!cell || cell.count === 0) return "No data";
    const rLabel = RECENCY_LABELS.find((r) => r.value === cell.rScore)?.label ?? "—";
    const fLabel = FREQUENCY_LABELS.find((f) => f.value === cell.fScore)?.label ?? "—";
    switch (metricType) {
      case "revenue":
        return `${rLabel} / ${fLabel}: ¥${(cell.totalRevenue / 1000000).toFixed(1)}M revenue, ${cell.percentage.toFixed(1)}% of customers`;
      case "aov":
        return `${rLabel} / ${fLabel}: AOV ${formatCurrency(Math.round(cell.averageRevenue))}, ${formatNumber(cell.count)} customers`;
      case "customers":
        return `${rLabel} / ${fLabel}: ${formatNumber(cell.count)} customers (${cell.percentage.toFixed(1)}%), ¥${(cell.totalRevenue / 1000000).toFixed(1)}M revenue`;
      default:
        return "";
    }
  };

  const metricDescription =
    metricType === "revenue"
      ? "Revenue by Recency (R) and Frequency (F). Green = higher, red = lower."
      : metricType === "aov"
        ? "Average order value by R-F segment."
        : "Customer count by R-F segment.";

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <CardTitle className="text-2xl">RFM matrix</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Metric:</span>
            <div className="flex rounded-lg border bg-muted/50 p-0.5">
              {(["revenue", "aov", "customers"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMetricType(m)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    metricType === m
                      ? "bg-background text-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "revenue" ? "Revenue" : m === "aov" ? "AOV" : "Customers"}
                </button>
              ))}
            </div>
          </div>
        </div>
        <CardDescription>{metricDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm font-semibold">Color scale</span>
              <div className="flex-1 flex items-center gap-2 min-w-[200px]">
                <div className="w-6 h-6 rounded border bg-green-600 shrink-0" />
                <div
                  className="h-4 flex-1 rounded-full border bg-muted overflow-hidden"
                  style={{
                    background: "linear-gradient(to right, rgb(22, 163, 74), rgb(34, 197, 94), rgb(132, 204, 22), rgb(250, 204, 21), rgb(251, 191, 36), rgb(251, 146, 60), rgb(249, 115, 22), rgb(239, 68, 68), rgb(220, 38, 38))",
                  }}
                />
                <div className="w-6 h-6 rounded border bg-red-500 shrink-0" />
              </div>
              <span className="text-xs text-muted-foreground">High → Low</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="flex mb-2">
                <div className="w-28 shrink-0" />
                {FREQUENCY_LABELS.map((f) => (
                  <div key={f.value} className="flex-1 min-w-[80px] text-center px-1">
                    <div className="text-xs font-semibold">F {f.value}</div>
                    {frequencyRanges[f.value] && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {frequencyRanges[f.value].min === frequencyRanges[f.value].max
                          ? `${frequencyRanges[f.value].min} txns`
                          : `${frequencyRanges[f.value].min}-${frequencyRanges[f.value].max} txns`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {RECENCY_LABELS.map((r) => (
                <div key={r.value} className="flex mb-1">
                  <div className="w-28 shrink-0 flex flex-col items-center justify-center text-xs px-1">
                    <span className="font-semibold">R {r.value}</span>
                    {recencyRanges[r.value] && (
                      <span className="text-muted-foreground mt-0.5">
                        {recencyRanges[r.value].min === recencyRanges[r.value].max
                          ? `${recencyRanges[r.value].min} days`
                          : `${recencyRanges[r.value].min}-${recencyRanges[r.value].max} days`}
                      </span>
                    )}
                  </div>
                  {[4, 3, 2, 1].map((f) => {
                    const data = cellDataMap.get(`${r.value}-${f}`);
                    return (
                      <div
                        key={f}
                        title={getTooltipText(data)}
                        className={`flex-1 min-w-[80px] h-20 border-2 rounded-md transition-colors border-border hover:border-primary/50 cursor-help flex flex-col items-center justify-center p-2 text-center ${getColorIntensity(getMetricValue(data))}`}
                      >
                        <div className="text-xs font-semibold text-gray-900 dark:text-white">
                          {getDisplayValue(data)}
                        </div>
                        {metricType !== "customers" && data && data.count > 0 && (
                          <div className="text-xs text-gray-700 dark:text-gray-200 mt-1">
                            {formatNumber(data.count)} customers
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
