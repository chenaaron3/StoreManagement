import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DayOfWeekData } from "@/types/analysis";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);
}

interface DayOfWeekChartProps {
  data: DayOfWeekData[];
}

export function DayOfWeekChart({ data }: DayOfWeekChartProps) {
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
    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-sm">
          Revenue: <span className="font-semibold">{formatCurrency(revenue)}</span>
        </p>
        <p className="text-xs text-muted-foreground">Percentile: {percentile}%</p>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by day of week</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
