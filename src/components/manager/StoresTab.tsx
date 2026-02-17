import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ExportCsvButton } from '@/components/ExportCsvButton';
import { MultiSeriesTrendChart } from '@/components/MultiSeriesTrendChart';
import { ButtonGroup } from '@/components/ui/button-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { TableContainer } from '@/components/ui/table-container';
import { formatCurrency } from '@/lib/utils';

import { ManagerCard } from './ManagerCard';

import type { PrecomputedData } from "@/utils/precomputedDataLoader";
import type { Granularity } from "@/types/analysis";
import type { PerformanceWithStoreBreakdown } from "@/types/analysis";
interface StoresTabProps {
  data: PrecomputedData;
}

export function StoresTab({ data }: StoresTabProps) {
  const { t } = useTranslation();
  const [granularity, setGranularity] = useState<Granularity>("monthly");

  const trendData =
    granularity === "weekly"
      ? data.storeTrendsWeekly
      : data.storeTrendsMonthly;

  const performance = (data.storePerformanceWithProducts ??
    []) as PerformanceWithStoreBreakdown[];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle>{t("storesTab.title")}</CardTitle>
            <div className="flex flex-wrap items-center gap-4">
              <ButtonGroup className="gap-2">
                {(["weekly", "monthly"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGranularity(g)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium ${granularity === g
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                  >
                    {t(`salesTab.${g}`)}
                  </button>
                ))}
              </ButtonGroup>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("storesTab.revenueOverTime")}
          </p>
        </CardHeader>
        <CardContent>
          <MultiSeriesTrendChart data={trendData} />
        </CardContent>
      </Card>

      <ManagerCard
        title={t("storesTab.performanceByProduct")}
        subtitle={t("storesTab.topStoresDesc")}
        headerAction={<ExportCsvButton />}
      >
        <TableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/60">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t("storesTab.store")}</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">{t("common.revenue")}</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t("storesTab.topProducts")}</th>
              </tr>
            </thead>
            <tbody>
              {performance.slice(0, 25).map((row, i) => (
                <tr key={row.name} className={`border-b border-border ${i % 2 === 1 ? "bg-muted/30" : ""} hover:bg-muted/40 transition-colors`}>
                  <td className="py-3 px-4 font-medium" title={row.name}>
                    {row.name.length > 40
                      ? `${row.name.slice(0, 40)}…`
                      : row.name}
                  </td>
                  <td className="text-right py-3 px-4 whitespace-nowrap tabular-nums">
                    {formatCurrency(row.totalRevenue)}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {row.stores
                      .slice(0, 5)
                      .map((s) => `${s.storeName} · ${formatCurrency(s.revenue)}`)
                      .join("  ·  ")}
                    {row.stores.length > 5 &&
                      ` ${t("productTab.more", { count: row.stores.length - 5 })}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableContainer>
        {performance.length === 0 && (
          <EmptyState>{t("storesTab.noData")}</EmptyState>
        )}
      </ManagerCard>
    </div>
  );
}
