import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonGroup } from "@/components/ui/button-group";
import { EmptyState } from "@/components/ui/empty-state";
import type { CustomerSegment } from "@/types/analysis";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface AdvancedCustomerSegmentationProps {
  frequencySegments: CustomerSegment[];
  ageSegments: CustomerSegment[];
  genderSegments: CustomerSegment[];
  channelSegments: CustomerSegment[];
  aovSegments: CustomerSegment[];
  lifetimeValueSegments: CustomerSegment[];
}

type SegmentationType = "frequency" | "age" | "gender" | "channel" | "aov" | "lifetimeValue";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
];

export function AdvancedCustomerSegmentation({
  frequencySegments,
  ageSegments,
  genderSegments,
  channelSegments,
  aovSegments,
  lifetimeValueSegments,
}: AdvancedCustomerSegmentationProps) {
  const { t } = useTranslation();
  const [activeSegment, setActiveSegment] = useState<SegmentationType>("frequency");

  const segmentData: Record<SegmentationType, CustomerSegment[]> = {
    frequency: frequencySegments,
    age: ageSegments,
    gender: genderSegments,
    channel: channelSegments,
    aov: aovSegments,
    lifetimeValue: lifetimeValueSegments,
  };

  const currentData = segmentData[activeSegment];
  const chartData = currentData.map((segment, index) => ({
    ...segment,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  const hasData = chartData.length > 0 && chartData.some((d) => d.count > 0);

  const translateSegment = (segment: string) =>
    t(`segmentLabels.${segment}`, { defaultValue: segment });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{t("customerSegmentation.title")}</CardTitle>
        <CardDescription>
          {t("customerSegmentation.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <ButtonGroup className="flex-wrap gap-2">
            {(["frequency", "age", "gender", "channel", "aov", "lifetimeValue"] as const).map(
              (type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActiveSegment(type)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                    activeSegment === type
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {t(`customerSegmentation.${type}`)}
                </button>
              )
            )}
          </ButtonGroup>
        </div>

        {!hasData ? (
          <EmptyState>{t("customerSegmentation.noData")}</EmptyState>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {t(`customerSegmentation.${activeSegment}`)} {t("customerSegmentation.distribution")}
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${translateSegment(name ?? "")}: ${((percent ?? 0) * 100).toFixed(1)}%`
                    }
                    outerRadius={100}
                    dataKey="count"
                    nameKey="segment"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number | undefined) => (value != null ? formatNumber(value) : "")}
                    content={({ active, payload }) => {
                      if (!active || !payload?.[0]) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-lg">
                          <p className="font-semibold">{translateSegment(data.segment)}</p>
                          <p className="text-sm text-muted-foreground">
                            {t("customerSegmentation.count")}: {formatNumber(data.count)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {data.percentage.toFixed(1)}%
                          </p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">{t("customerSegmentation.revenueBySegment")}</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 5, right: 50, left: 130, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => `¥${(v / 1000000).toFixed(1)}M`}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                  <YAxis
                    dataKey="segment"
                    type="category"
                    width={110}
                    tickFormatter={translateSegment}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.[0]) return null;
                      const data = payload[0].payload;
                      const ltv = data.count > 0 ? data.totalRevenue / data.count : 0;
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-lg space-y-1">
                          <p className="font-semibold">{translateSegment(data.segment)}</p>
                          <p className="text-sm">
                            {t("common.revenue")}: {formatCurrency(data.totalRevenue)}
                          </p>
                          <p className="text-sm">{t("customerSegmentation.aov")}: {formatCurrency(Math.round(data.averageRevenue))}</p>
                          <p className="text-sm">{t("customerSegmentation.lifetimeValue")}: {formatCurrency(Math.round(ltv))}</p>
                          <p className="text-xs text-muted-foreground">
                            {t("customerSegmentation.customersCount", { count: data.count, percent: data.percentage.toFixed(1) })}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="totalRevenue" fill="var(--chart-1)" name={t("common.revenue")}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
