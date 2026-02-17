import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface BrandBarChartData {
  name: string;
  fullName?: string;
  [k: string]: string | number | undefined;
}

interface BrandBarChartProps {
  data: BrandBarChartData[];
  dataKey: string;
  titleKey: string;
  total: number;
  valueFormatter: (v: number) => string;
  tickFormatter: (v: number) => string;
  valueLabelKey: string;
}

export function BrandBarChart({
  data,
  dataKey,
  titleKey,
  total,
  valueFormatter,
  tickFormatter,
  valueLabelKey,
}: BrandBarChartProps) {
  const { t } = useTranslation();
  if (data.length === 0) return null;
  const chartHeight = Math.max(140, Math.min(400, data.length * 44));
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t(titleKey)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div
          className="overflow-visible w-full min-w-0"
          style={{ color: "var(--foreground)" }}
        >
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 12, right: 78, left: 44, bottom: 12 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                type="number"
                tickFormatter={tickFormatter}
                tick={{ fontSize: 11, fill: "currentColor" }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={48}
                tick={{ fontSize: 11, fill: "currentColor" }}
                interval={0}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const d = payload[0].payload;
                  const label =
                    (d as { fullName?: string }).fullName ??
                    (d as { name: string }).name;
                  const value = (d as Record<string, unknown>)[dataKey] as number;
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-lg text-sm">
                      <p className="font-semibold">{label}</p>
                      <p>
                        {t(valueLabelKey)}: {valueFormatter(value)}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey={dataKey}
                fill="var(--chart-1)"
                name={t(valueLabelKey)}
                radius={[0, 2, 2, 0]}
              >
                <LabelList
                  dataKey={dataKey}
                  position="right"
                  formatter={(label) => valueFormatter(Number(label ?? 0))}
                  style={{ fontSize: 11, fill: "currentColor" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs font-medium text-foreground border-t pt-2 text-right">
          {t("brandTab.allBrandsTotal")}: {valueFormatter(total)}
        </p>
      </CardContent>
    </Card>
  );
}
