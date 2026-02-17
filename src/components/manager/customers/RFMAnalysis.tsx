import { HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ButtonGroup } from '@/components/ui/button-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatCurrency, formatNumber } from '@/lib/utils';

import { RFMColorScale } from './RFMColorScale';
import { RFMCouponModal } from './RFMCouponModal';
import { RFMMatrixGrid } from './RFMMatrixGrid';

import type { RFMMatrixCell } from "@/types/analysis";
type MetricType = "revenue" | "aov" | "customers";

interface RFMAnalysisProps {
  rfmMatrix: RFMMatrixCell[];
}

const RECENCY_KEYS = ["mostRecent", "recent", "lessRecent", "leastRecent"] as const;
const FREQUENCY_KEYS = ["high", "mediumHigh", "mediumLow", "low"] as const;

export function RFMAnalysis({ rfmMatrix }: RFMAnalysisProps) {
  const { t } = useTranslation();
  const [metricType, setMetricType] = useState<MetricType>("revenue");
  const [selectedCell, setSelectedCell] = useState<RFMMatrixCell | null>(null);

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
  const sorted = [...metricValues].sort((a, b) => a - b);
  const p75 = sorted[Math.floor(sorted.length * 0.75)] ?? sorted[0];
  const p50 = sorted[Math.floor(sorted.length * 0.5)] ?? sorted[0];
  const p25 = sorted[Math.floor(sorted.length * 0.25)] ?? sorted[0];

  const getColorStyle = (value: number): React.CSSProperties => {
    if (value === 0) return {};
    if (value >= p75) return { backgroundColor: "var(--chart-2)" };
    if (value >= p50) return { backgroundColor: "var(--chart-3)" };
    if (value >= p25) return { backgroundColor: "var(--chart-8)" };
    return { backgroundColor: "var(--chart-5)" };
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
    if (!cell || cell.count === 0) return t("rfm.noData");
    const rLabel = t("rfmLabels." + (RECENCY_KEYS[4 - cell.rScore] ?? "leastRecent"));
    const fLabel = t("rfmLabels." + (FREQUENCY_KEYS[4 - cell.fScore] ?? "low"));
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
      ? t("rfm.descRevenue")
      : metricType === "aov"
        ? t("rfm.descAov")
        : t("rfm.descCustomers");

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl">{t("rfm.title")}</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label={t("rfm.explanation")}
                  >
                    <HelpCircle className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[280px]">
                  {t("rfm.explanation")}
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-muted-foreground">{t("rfm.metric")}:</span>
                <ButtonGroup>
                  {(["revenue", "aov", "customers"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMetricType(m)}
                      className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${metricType === m
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                    >
                      {t(`rfm.${m}`)}
                    </button>
                  ))}
                </ButtonGroup>
              </div>
            </div>
          </div>
          <CardDescription>{metricDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <RFMColorScale />
            <RFMMatrixGrid
              cellDataMap={cellDataMap}
              recencyRanges={recencyRanges}
              frequencyRanges={frequencyRanges}
              getMetricValue={getMetricValue}
              getColorStyle={getColorStyle}
              getDisplayValue={getDisplayValue}
              getTooltipText={getTooltipText}
              metricType={metricType}
              onCellClick={setSelectedCell}
            />
          </div>
        </CardContent>
      </Card>

      <RFMCouponModal selectedCell={selectedCell} onClose={() => setSelectedCell(null)} />
    </>
  );
}
