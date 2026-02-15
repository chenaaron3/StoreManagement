import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

export interface CategoryCount {
  label: string
  count: number
}

interface CategoryTrendChartProps {
  categoryCounts: CategoryCount[]
}

export function CategoryTrendChart({ categoryCounts }: CategoryTrendChartProps) {
  if (categoryCounts.length === 0) {
    return <p className="text-sm text-muted-foreground">No category data yet</p>
  }

  return (
    <ResponsiveContainer width="100%" height={Math.min(200, categoryCounts.length * 36)}>
      <BarChart
        data={categoryCounts}
        layout="vertical"
        margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="2 2" className="opacity-60" />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          width={72}
          tick={{ fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.[0]) return null
            const { label, count } = payload[0].payload
            return (
              <div className="rounded-md border bg-background px-3 py-2 text-sm shadow-sm">
                <p className="font-medium">{label}</p>
                <p className="text-muted-foreground">Count: {count}</p>
              </div>
            )
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {categoryCounts.map((_, i) => (
            <Cell key={categoryCounts[i].label} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
