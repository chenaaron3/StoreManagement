import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';

interface StoreSalesTrendChartProps {
  data: { date: string;[key: string]: string | number }[];
  seriesKeys: string[];
  granularity: "weekly" | "monthly";
  height?: number;
  className?: string;
}

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)"];

export function StoreSalesTrendChart({
  data,
  seriesKeys,
  height = 300,
  className,
}: StoreSalesTrendChartProps) {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    if (!data?.length) return [];
    return data.map((row) => {
      const out: Record<string, string | number> = { date: row.date };
      seriesKeys.forEach((key) => {
        out[key] = row[key] ?? 0;
      });
      return out;
    });
  }, [data, seriesKeys]);

  if (!chartData.length) return null;

  return (
    <Card className={cn("flex flex-col py-2 gap-2", className)}>
      <CardHeader className="pb-0 pt-5">
        <CardTitle className="text-base">{t("salesTab.storeSalesTrend")}</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col pt-0" style={{ minHeight: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              angle={-45}
              textAnchor="end"
              height={36}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              tickFormatter={(v) => (v >= 1e6 ? `¥${(v / 1e6).toFixed(0)}M` : `¥${(v / 1000).toFixed(0)}k`)}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              width={45}
            />
            <Tooltip
              formatter={(value: number | undefined) => (value != null ? formatCurrency(value) : "")}
              labelFormatter={(label) => label}
            />
            {seriesKeys.map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                fill={CHART_COLORS[i % CHART_COLORS.length]}
                name={key}
                radius={[0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
