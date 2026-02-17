import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ExportCsvButton } from '@/components/ExportCsvButton';
import { MultiSeriesTrendChart } from '@/components/MultiSeriesTrendChart';
import { ButtonGroup } from '@/components/ui/button-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { TableContainer } from '@/components/ui/table-container';
import { formatCurrency } from '@/lib/utils';

import { BrandFilterSelect } from './BrandFilterSelect';
import { ManagerCard } from './ManagerCard';

import type { PrecomputedData } from "@/utils/precomputedDataLoader";
import type { Granularity } from "@/types/analysis";
import type { PerformanceWithStoreBreakdown } from "@/types/analysis";
import type { BrandOption } from "./BrandFilterSelect";
type ProductViewType = "product" | "collection" | "category" | "color" | "size";

interface ProductTabProps {
  data: PrecomputedData;
  brandFilter: string;
  onBrandFilterChange: (code: string) => void;
  brandOptions: BrandOption[];
}

const VIEW_KEYS: Record<ProductViewType, string> = {
  product: "product",
  collection: "collection",
  category: "category",
  color: "color",
  size: "size",
};

export function ProductTab({ data, brandFilter, onBrandFilterChange, brandOptions }: ProductTabProps) {
  const { t } = useTranslation();
  const [viewType, setViewType] = useState<ProductViewType>("product");
  const [granularity, setGranularity] = useState<Granularity>("monthly");

  const trendData = (() => {
    if (viewType === "product")
      return granularity === "weekly"
        ? data.productTrendsWeekly
        : data.productTrendsMonthly;
    if (viewType === "collection")
      return granularity === "weekly"
        ? data.collectionTrendsWeekly
        : data.collectionTrendsMonthly;
    if (viewType === "category")
      return granularity === "weekly"
        ? data.categoryTrendsWeekly
        : data.categoryTrendsMonthly;
    if (viewType === "color") return data.colorTrends ?? [];
    if (viewType === "size") return data.sizeTrends ?? [];
    return [];
  })();

  const performance = ((): PerformanceWithStoreBreakdown[] => {
    if (viewType === "product") return data.productPerformanceWithStores ?? [];
    if (viewType === "collection") return data.collectionPerformanceWithStores ?? [];
    if (viewType === "category") return data.categoryPerformanceWithStores ?? [];
    if (viewType === "color") return data.colorPerformanceWithStores ?? [];
    if (viewType === "size") return data.sizePerformanceWithStores ?? [];
    return [];
  })() as PerformanceWithStoreBreakdown[];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle>{t("productTab.trends", { view: t(`productTab.${VIEW_KEYS[viewType]}`) })}</CardTitle>
            <div className="flex flex-1 flex-wrap items-center justify-end gap-4 min-w-0">
              <BrandFilterSelect
                selectedBrandCode={brandFilter}
                brandOptions={brandOptions}
                onBrandChange={onBrandFilterChange}
                idPrefix="product"
              />
              <ButtonGroup className="shrink-0">
                {(Object.keys(VIEW_KEYS) as ProductViewType[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setViewType(v)}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap ${viewType === v
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                  >
                    {t(`productTab.${VIEW_KEYS[v]}`)}
                  </button>
                ))}
              </ButtonGroup>
              <ButtonGroup className="gap-2 shrink-0">
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
            {t("productTab.revenueOverTime", { view: t(`productTab.${VIEW_KEYS[viewType]}`) })}
          </p>
        </CardHeader>
        <CardContent>
          <MultiSeriesTrendChart data={trendData} />
        </CardContent>
      </Card>

      <ManagerCard
        title={t("productTab.performanceByStore", { view: t(`productTab.${VIEW_KEYS[viewType]}`) })}
        subtitle={t("productTab.topItemsDesc")}
        headerAction={<ExportCsvButton />}
      >
        <TableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/60">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground min-w-[108px]">{t("productTab.productCol")}</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">{t("common.revenue")}</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t("productTab.topStores")}</th>
              </tr>
            </thead>
            <tbody>
              {performance.slice(0, 25).map((row, i) => (
                <tr key={row.name} className={`border-b border-border ${i % 2 === 1 ? "bg-muted/30" : ""} hover:bg-muted/40 transition-colors`}>
                  <td className="py-3 px-4 min-w-[108px] font-medium" title={row.name}>
                    {row.name.length > 50
                      ? `${row.name.slice(0, 50)}…`
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
          <EmptyState>{t("productTab.noData")}</EmptyState>
        )}
      </ManagerCard>
    </div>
  );
}
