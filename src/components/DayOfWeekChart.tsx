import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

import type { DayOfWeekData } from "@/types/analysis";
interface DayOfWeekChartProps {
  data: DayOfWeekData[];
}

export function DayOfWeekChart({ data }: DayOfWeekChartProps) {
  const { t } = useTranslation();
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: { value: number }[];
    label?: string;
  }) => {
    if (!active || !payload?.length || label == null) return null;
    const revenue = payload[0].value;
    const revenues = data.map((d) => d.revenue);
    const maxR = Math.max(...revenues);
    const minR = Math.min(...revenues);
    const percentile =
      maxR === minR ? 100 : Math.round(((revenue - minR) / (maxR - minR)) * 100);
    const dayLabel = typeof label === "string" ? String(t(`chart.daysOfWeek.${label}`, { defaultValue: label })) : String(label);
    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg">
        <p className="text-sm font-semibold">{dayLabel}</p>
        <p className="text-sm">
          {t("chart.revenue")}: <span className="font-semibold">{formatCurrency(revenue)}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          {t("chart.percentile")}: {percentile}%
        </p>
      </div>
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{t("salesTab.revenueByDayOfWeek")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 40, left: 55, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="day"
              tickFormatter={(day) => String(t(`chart.daysOfWeek.${day}`, { defaultValue: day }))}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" fill="var(--chart-1)" name={t("chart.revenue")} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
