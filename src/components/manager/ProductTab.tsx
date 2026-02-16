import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonGroup } from "@/components/ui/button-group";
import { EmptyState } from "@/components/ui/empty-state";
import { TableContainer } from "@/components/ui/table-container";
import { ManagerCard } from "./ManagerCard";
import { ExportCsvButton } from "@/components/ExportCsvButton";
import { MultiSeriesTrendChart } from "@/components/MultiSeriesTrendChart";
import type { PrecomputedData } from "@/utils/precomputedDataLoader";
import type { Granularity } from "@/utils/dataAnalysis";
import type { PerformanceWithStoreBreakdown } from "@/types/analysis";
import type { BrandOption } from "./BrandFilterSelect";
import { BrandFilterSelect } from "./BrandFilterSelect";

type ProductViewType = "product" | "collection" | "category" | "color" | "size";

interface ProductTabProps {
  data: PrecomputedData;
  brandFilter: string;
  onBrandFilterChange: (code: string) => void;
  brandOptions: BrandOption[];
}

import { formatCurrency } from "@/lib/utils";

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

  const showGranularity =
    viewType === "product" || viewType === "collection" || viewType === "category";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle>{t("productTab.trends", { view: t(`productTab.${VIEW_KEYS[viewType]}`) })}</CardTitle>
            <div className="flex flex-wrap items-center gap-4">
              <BrandFilterSelect
                selectedBrandCode={brandFilter}
                brandOptions={brandOptions}
                onBrandChange={onBrandFilterChange}
                idPrefix="product"
              />
              <div className="flex flex-wrap items-center gap-3">
              <ButtonGroup>
                {(Object.keys(VIEW_KEYS) as ProductViewType[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setViewType(v)}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${
                      viewType === v
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {t(`productTab.${VIEW_KEYS[v]}`)}
                  </button>
                ))}
              </ButtonGroup>
              {showGranularity && (
                <ButtonGroup className="gap-2">
                  {(["weekly", "monthly"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGranularity(g)}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                        granularity === g
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {t(`salesTab.${g}`)}
                    </button>
                  ))}
                </ButtonGroup>
              )}
              </div>
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
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium">{t("productTab.productCol")}</th>
                  <th className="text-right py-2 px-4 font-medium">{t("common.revenue")}</th>
                  <th className="text-left py-2 pl-4 font-medium">{t("productTab.topStores")}</th>
                </tr>
              </thead>
              <tbody>
                {performance.slice(0, 25).map((row) => (
                  <tr key={row.name} className="border-b">
                    <td className="py-2 pr-4" title={row.name}>
                      {row.name.length > 50
                        ? `${row.name.slice(0, 50)}…`
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
          <EmptyState>{t("productTab.noData")}</EmptyState>
        )}
      </ManagerCard>
    </div>
  );
}
