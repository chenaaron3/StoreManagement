import {
    CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

import { formatCurrency } from '@/lib/utils';

export type MultiSeriesTrendRow = { date: string;[key: string]: string | number };

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

interface MultiSeriesTrendChartProps {
  data: MultiSeriesTrendRow[];
}

export function MultiSeriesTrendChart({ data }: MultiSeriesTrendChartProps) {
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: { name: string; value: number; color: string }[];
    label?: string;
  }) => {
    if (!active || !payload?.length || label == null) return null;
    const sorted = [...payload].sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg">
        <p className="text-sm font-semibold">{label}</p>
        <div className="mt-1 space-y-0.5">
          {sorted.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm truncate max-w-[200px]" title={entry.name}>
                {entry.name.length > 35 ? `${entry.name.slice(0, 35)}…` : entry.name}:
              </span>
              <span className="text-sm font-medium">
                {formatCurrency(entry.value ?? 0)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!data?.length) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        No trend data available.
      </div>
    );
  }

  const seriesKeys = Object.keys(data[0]).filter((k) => k !== "date");

  return (
    <div className="overflow-visible w-full" style={{ color: "var(--foreground)" }}>
      <ResponsiveContainer width="100%" height={380}>
        <LineChart data={data} margin={{ top: 16, right: 32, left: 8, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            angle={-45}
            textAnchor="end"
            height={72}
            tick={{ fontSize: 12, fill: "currentColor" }}
            interval={0}
          />
          <YAxis
            tickFormatter={(v) => (v >= 1e6 ? `¥${(v / 1e6).toFixed(0)}M` : `¥${(v / 1000).toFixed(0)}k`)}
            tick={{ fontSize: 12, fill: "currentColor" }}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          {seriesKeys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={key}
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
