import { useState } from "react";
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

const SEGMENT_LABELS: Record<SegmentationType, string> = {
  frequency: "Frequency",
  age: "Age",
  gender: "Gender",
  channel: "Channel",
  aov: "AOV",
  lifetimeValue: "Lifetime value",
};

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Customer segmentation</CardTitle>
        <CardDescription>
          Distribution and revenue by segment. Choose a dimension below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <label className="text-sm font-medium text-muted-foreground block mb-2">
            Dimension
          </label>
          <div className="flex flex-wrap gap-2 rounded-lg border bg-muted/30 p-2">
            {(["frequency", "age", "gender", "channel", "aov", "lifetimeValue"] as const).map(
              (type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActiveSegment(type)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    activeSegment === type
                      ? "bg-background text-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {SEGMENT_LABELS[type]}
                </button>
              )
            )}
          </div>
        </div>

        {!hasData ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No segment data for this dimension.
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {SEGMENT_LABELS[activeSegment]} distribution
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${name ?? ""}: ${((percent ?? 0) * 100).toFixed(1)}%`
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
                          <p className="font-semibold">{data.segment}</p>
                          <p className="text-sm text-muted-foreground">
                            Count: {formatNumber(data.count)}
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
              <h3 className="text-lg font-semibold mb-4">Revenue by segment</h3>
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
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.[0]) return null;
                      const data = payload[0].payload;
                      const ltv = data.count > 0 ? data.totalRevenue / data.count : 0;
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-lg space-y-1">
                          <p className="font-semibold">{data.segment}</p>
                          <p className="text-sm">
                            Revenue: {formatCurrency(data.totalRevenue)}
                          </p>
                          <p className="text-sm">AOV: {formatCurrency(Math.round(data.averageRevenue))}</p>
                          <p className="text-sm">LTV: {formatCurrency(Math.round(ltv))}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatNumber(data.count)} customers ({data.percentage.toFixed(1)}%)
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="totalRevenue" fill="var(--chart-1)" name="Revenue">
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
