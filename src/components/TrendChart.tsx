import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TimeSeriesData } from "@/types/analysis";
import type { Granularity } from "@/types/analysis";
import { RevenuePercentileTooltip } from "@/components/charts/RevenuePercentileTooltip";

interface TrendChartProps {
  data: TimeSeriesData[];
  granularity: Granularity;
}

export function TrendChart({ data }: TrendChartProps) {
  const { t } = useTranslation();
  const revenues = data.map((d) => d.revenue);

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
    return (
      <RevenuePercentileTooltip
        label={label}
        revenue={payload[0].value}
        revenues={revenues}
      />
    );
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 5, right: 40, left: 55, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="date"
          angle={-45}
          textAnchor="end"
          height={80}
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
  );
}
