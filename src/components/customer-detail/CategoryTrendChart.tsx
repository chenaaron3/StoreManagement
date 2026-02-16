import { useTranslation } from "react-i18next"
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
  const { t } = useTranslation()
  if (categoryCounts.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("customerDetail.noCategoryData")}</p>
  }

  return (
    <ResponsiveContainer width="100%" height={Math.min(200, categoryCounts.length * 36)}>
      <BarChart
        data={categoryCounts}
        layout="vertical"
        margin={{ top: 0, right: 16, left: 60, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="2 2" stroke="var(--border)" className="opacity-60" />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          width={72}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
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
                <p className="text-muted-foreground">{t("common.count")}: {count}</p>
              </div>
            )
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} name={t("common.count")}>
          {categoryCounts.map((_, i) => (
            <Cell key={categoryCounts[i].label} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
