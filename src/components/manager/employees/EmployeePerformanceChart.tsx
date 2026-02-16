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
import { formatCurrency } from "@/lib/utils";

interface ChartItem {
  name: string;
  fullName: string;
  revenue: number;
  stores: string;
  topProducts: string;
}

interface EmployeePerformanceChartProps {
  data: ChartItem[];
}

export function EmployeePerformanceChart({ data }: EmployeePerformanceChartProps) {
  const { t } = useTranslation();
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={Math.min(400, data.length * 28)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 50, left: 130, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          type="number"
          tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={115}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.[0]) return null;
            const d = payload[0].payload as ChartItem;
            return (
              <div className="rounded-lg border bg-background p-3 shadow-lg text-sm">
                <p className="font-semibold">{d.fullName}</p>
                <p>{t("chart.revenue")}: {formatCurrency(d.revenue)}</p>
                {d.stores && (
                  <p className="text-muted-foreground mt-1">
                    Stores: {d.stores}
                  </p>
                )}
                {d.topProducts && (
                  <p className="text-muted-foreground mt-1 max-w-xs">
                    Top: {d.topProducts}
                  </p>
                )}
              </div>
            );
          }}
        />
        <Bar dataKey="revenue" fill="var(--chart-1)" name={t("chart.revenue")} />
      </BarChart>
    </ResponsiveContainer>
  );
}
