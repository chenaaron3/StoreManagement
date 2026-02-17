import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { ExportCsvButton } from "@/components/ExportCsvButton";
import { MultiSeriesTrendChart } from "@/components/MultiSeriesTrendChart";
import type { MultiSeriesTrendRow } from "@/components/MultiSeriesTrendChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableContainer } from "@/components/ui/table-container";
import { formatCurrency, formatNumber } from "@/lib/utils";

import { BrandBarChart } from "./BrandBarChart";
import { ManagerCard } from "./ManagerCard";

import type { PrecomputedData } from "@/utils/precomputedDataLoader";

interface BrandTabProps {
  data: PrecomputedData;
}

export function BrandTab({ data }: BrandTabProps) {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    const brands = data.brandPerformance.slice(0, 14);
    return brands.map((b) => ({
      name: (b.brandName || b.brandCode).length > 12
        ? `${(b.brandName || b.brandCode).slice(0, 12)}…`
        : b.brandName || b.brandCode,
      fullName: b.brandName || b.brandCode,
      totalRevenue: b.totalRevenue,
      transactions: b.transactions,
      averageOrderValue: b.averageOrderValue,
    }));
  }, [data.brandPerformance]);

  const revenueChartData = useMemo(
    () => chartData.map((d) => ({ ...d, value: d.totalRevenue })),
    [chartData]
  );
  const transactionsChartData = useMemo(
    () => chartData.map((d) => ({ ...d, value: d.transactions })),
    [chartData]
  );
  const aovChartData = useMemo(
    () => chartData.map((d) => ({ ...d, value: d.averageOrderValue })),
    [chartData]
  );

  const revenueOverTimeByBrand = useMemo(() => {
    const byBrand = data.byBrand;
    if (!byBrand || !data.brandPerformance?.length) return null;
    const dateSet = new Set<string>();
    for (const brandData of Object.values(byBrand)) {
      const trend = brandData.trendDataMonthly as { date: string; revenue: number }[] | undefined;
      trend?.forEach((p) => dateSet.add(p.date));
    }
    const dates = Array.from(dateSet).sort();
    if (dates.length === 0) return null;
    const brandCodes = Object.keys(byBrand);
    const rows: MultiSeriesTrendRow[] = dates.map((date) => {
      const row: MultiSeriesTrendRow = { date };
      for (const code of brandCodes) {
        const brand = data.brandPerformance?.find((b) => b.brandCode === code);
        const name = brand?.brandName || code;
        const trend = (byBrand[code].trendDataMonthly as { date: string; revenue: number }[]) || [];
        const point = trend.find((p) => p.date === date);
        row[name] = point?.revenue ?? 0;
      }
      return row;
    });
    return rows;
  }, [data.byBrand, data.brandPerformance]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <BrandBarChart
          data={revenueChartData}
          dataKey="value"
          titleKey="brandTab.revenueByBrand"
          total={revenueChartData.reduce((s, d) => s + (d.value as number), 0)}
          valueLabelKey="common.revenue"
          valueFormatter={formatCurrency}
          tickFormatter={(v) => `¥${(v / 1e6).toFixed(0)}M`}
        />
        <BrandBarChart
          data={transactionsChartData}
          dataKey="value"
          titleKey="brandTab.transactionsByBrand"
          total={transactionsChartData.reduce((s, d) => s + (d.value as number), 0)}
          valueLabelKey="brandTab.transactions"
          valueFormatter={(v) => formatNumber(v)}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
        />
        <BrandBarChart
          data={aovChartData}
          dataKey="value"
          titleKey="brandTab.aovByBrand"
          total={(() => { const tr = revenueChartData.reduce((s, d) => s + (d.value as number), 0); const tx = transactionsChartData.reduce((s, d) => s + (d.value as number), 0); return tx > 0 ? tr / tx : 0; })()}
          valueLabelKey="brandTab.aov"
          valueFormatter={formatCurrency}
          tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`}
        />
      </div>

      {revenueOverTimeByBrand && revenueOverTimeByBrand.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("brandTab.revenueOverTimeByBrand")}</CardTitle>
          </CardHeader>
          <CardContent>
            <MultiSeriesTrendChart data={revenueOverTimeByBrand} />
          </CardContent>
        </Card>
      )}

      <ManagerCard
        title={t("brandTab.title")}
        subtitle={t("brandTab.subtitle")}
        headerAction={<ExportCsvButton />}
      >
        <TableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/60">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t("brandTab.brand")}</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">{t("common.revenue")}</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">{t("brandTab.transactions")}</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">{t("brandTab.customers")}</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">{t("brandTab.aov")}</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">{t("brandTab.stores")}</th>
              </tr>
            </thead>
            <tbody>
              {data.brandPerformance.slice(0, 14).map((b, i) => (
                <tr key={b.brandCode} className={`border-b border-border ${i % 2 === 1 ? "bg-muted/30" : ""} hover:bg-muted/40 transition-colors`}>
                  <td className="py-3 px-4 font-medium">{b.brandName || b.brandCode}</td>
                  <td className="text-right py-3 px-4 whitespace-nowrap tabular-nums">{formatCurrency(b.totalRevenue)}</td>
                  <td className="text-right py-3 px-4 tabular-nums">{b.transactions.toLocaleString()}</td>
                  <td className="text-right py-3 px-4 tabular-nums">{b.customers.toLocaleString()}</td>
                  <td className="text-right py-3 px-4 whitespace-nowrap tabular-nums">{formatCurrency(b.averageOrderValue)}</td>
                  <td className="text-right py-3 px-4 tabular-nums">{b.storeCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableContainer>
      </ManagerCard>
    </div>
  );
}
