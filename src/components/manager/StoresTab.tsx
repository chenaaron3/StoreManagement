import { useState } from "react";
import { useTranslation } from "react-i18next";

import { MultiSeriesTrendChart } from '@/components/MultiSeriesTrendChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ButtonGroup } from "@/components/ui/button-group";
import { EmptyState } from "@/components/ui/empty-state";
import { TableContainer } from "@/components/ui/table-container";
import { ManagerCard } from "./ManagerCard";
import { ExportCsvButton } from "@/components/ExportCsvButton";

import type { PrecomputedData } from "@/utils/precomputedDataLoader";
import type { Granularity } from "@/utils/dataAnalysis";
import type { PerformanceWithStoreBreakdown } from "@/types/analysis";
import type { BrandOption } from "./BrandFilterSelect";
import { BrandFilterSelect } from "./BrandFilterSelect";

interface StoresTabProps {
  data: PrecomputedData;
  brandFilter: string;
  onBrandFilterChange: (code: string) => void;
  brandOptions: BrandOption[];
}

import { formatCurrency } from "@/lib/utils";

export function StoresTab({ data, brandFilter, onBrandFilterChange, brandOptions }: StoresTabProps) {
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
              <BrandFilterSelect
                selectedBrandCode={brandFilter}
                brandOptions={brandOptions}
                onBrandChange={onBrandFilterChange}
                idPrefix="stores"
              />
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
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium">{t("storesTab.store")}</th>
                  <th className="text-right py-2 px-4 font-medium">{t("common.revenue")}</th>
                  <th className="text-left py-2 pl-4 font-medium">{t("storesTab.topProducts")}</th>
                </tr>
              </thead>
              <tbody>
                {performance.slice(0, 25).map((row) => (
                  <tr key={row.name} className="border-b">
                    <td className="py-2 pr-4" title={row.name}>
                      {row.name.length > 40
                        ? `${row.name.slice(0, 40)}…`
                        : row.name}
                    </td>
                    <td className="text-right py-2 px-4 whitespace-nowrap">
                      {formatCurrency(row.totalRevenue)}
                    </td>
                    <td className="py-2 pl-4 text-muted-foreground">
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
