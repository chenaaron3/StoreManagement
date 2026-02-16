import { useTranslation } from "react-i18next";
import type { RFMMatrixCell } from "@/types/analysis";
import { formatNumber } from "@/lib/utils";

type MetricType = "revenue" | "aov" | "customers";

interface RFMMatrixGridProps {
  cellDataMap: Map<string, RFMMatrixCell>;
  recencyRanges: Record<number, { min: number; max: number }>;
  frequencyRanges: Record<number, { min: number; max: number }>;
  getMetricValue: (cell: RFMMatrixCell | undefined) => number;
  getColorStyle: (value: number) => React.CSSProperties;
  getDisplayValue: (cell: RFMMatrixCell | undefined) => string;
  getTooltipText: (cell: RFMMatrixCell | undefined) => string;
  metricType: MetricType;
  onCellClick: (cell: RFMMatrixCell) => void;
}

export function RFMMatrixGrid({
  cellDataMap,
  recencyRanges,
  frequencyRanges,
  getMetricValue,
  getColorStyle,
  getDisplayValue,
  getTooltipText,
  metricType,
  onCellClick,
}: RFMMatrixGridProps) {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="flex mb-2">
          <div className="w-28 shrink-0" />
          {([4, 3, 2, 1] as const).map((val) => (
            <div key={val} className="flex-1 min-w-[80px] text-center px-1">
              <div className="text-xs font-semibold">F {val}</div>
              {frequencyRanges[val] && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {frequencyRanges[val].min === frequencyRanges[val].max
                    ? `${frequencyRanges[val].min} ${t("rfm.txns")}`
                    : `${frequencyRanges[val].min}-${frequencyRanges[val].max} ${t("rfm.txns")}`}
                </div>
              )}
            </div>
          ))}
        </div>
        {([4, 3, 2, 1] as const).map((rVal) => (
          <div key={rVal} className="flex mb-1">
            <div className="w-28 shrink-0 flex flex-col items-center justify-center text-xs px-1">
              <span className="font-semibold">R {rVal}</span>
              {recencyRanges[rVal] && (
                <span className="text-muted-foreground mt-0.5">
                  {recencyRanges[rVal].min === recencyRanges[rVal].max
                    ? `${recencyRanges[rVal].min} ${t("rfm.days")}`
                    : `${recencyRanges[rVal].min}-${recencyRanges[rVal].max} ${t("rfm.days")}`}
                </span>
              )}
            </div>
            {[4, 3, 2, 1].map((f) => {
              const data = cellDataMap.get(`${rVal}-${f}`);
              const hasData = data && data.count > 0;
              const value = getMetricValue(data);
              return (
                <button
                  key={f}
                  type="button"
                  title={getTooltipText(data)}
                  onClick={() => hasData && onCellClick(data)}
                  className={`flex-1 min-w-[80px] h-20 border-2 rounded-md transition-colors border-border hover:border-primary/50 flex flex-col items-center justify-center p-2 text-center ${
                    value === 0 ? "bg-muted cursor-default" : "cursor-pointer"
                  }`}
                  style={value === 0 ? undefined : getColorStyle(value)}
                >
                  <div
                    className={`text-xs font-semibold ${
                      value === 0 ? "text-foreground" : "text-white"
                    }`}
                  >
                    {getDisplayValue(data)}
                  </div>
                  {metricType !== "customers" && data && data.count > 0 && (
                    <div
                      className={`text-xs mt-1 ${
                        value === 0 ? "text-muted-foreground" : "text-white/90"
                      }`}
                    >
                      {formatNumber(data.count)} {t("rfm.customersLabel")}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
