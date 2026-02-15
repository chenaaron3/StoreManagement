import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MultiSeriesTrendChart } from "@/components/MultiSeriesTrendChart";
import type { PrecomputedData } from "@/utils/precomputedDataLoader";
import type { Granularity } from "@/utils/dataAnalysis";
import type { PerformanceWithStoreBreakdown } from "@/types/analysis";

type ProductViewType = "product" | "collection" | "category" | "color" | "size";

interface ProductTabProps {
  data: PrecomputedData;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);

const VIEW_LABELS: Record<ProductViewType, string> = {
  product: "Product",
  collection: "Collection (brand)",
  category: "Category",
  color: "Color",
  size: "Size",
};

export function ProductTab({ data }: ProductTabProps) {
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
            <CardTitle>{VIEW_LABELS[viewType]} trends</CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-1.5">
                {(Object.keys(VIEW_LABELS) as ProductViewType[]).map((v) => (
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
                    {VIEW_LABELS[v]}
                  </button>
                ))}
              </div>
              {showGranularity && (
                <div className="flex gap-2">
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
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Revenue over time for top items by {viewType}.
          </p>
        </CardHeader>
        <CardContent>
          <MultiSeriesTrendChart data={trendData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{VIEW_LABELS[viewType]} performance by store</CardTitle>
          <p className="text-sm text-muted-foreground">
            Top items with revenue and store breakdown.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Product</th>
                  <th className="text-right py-2 font-medium">Revenue</th>
                  <th className="text-left py-2 font-medium">Top stores</th>
                </tr>
              </thead>
              <tbody>
                {performance.slice(0, 25).map((row) => (
                  <tr key={row.name} className="border-b">
                    <td className="py-2" title={row.name}>
                      {row.name.length > 50
                        ? `${row.name.slice(0, 50)}…`
                        : row.name}
                    </td>
                    <td className="text-right py-2">
                      {formatCurrency(row.totalRevenue)}
                    </td>
                    <td className="py-2 text-muted-foreground">
                      {row.stores
                        .slice(0, 5)
                        .map((s) => `${s.storeName} (${formatCurrency(s.revenue)})`)
                        .join(" · ")}
                      {row.stores.length > 5 &&
                        ` +${row.stores.length - 5} more`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {performance.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">
              No performance data for this view.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
