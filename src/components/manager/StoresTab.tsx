import { useState } from 'react';

import { MultiSeriesTrendChart } from '@/components/MultiSeriesTrendChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { PrecomputedData } from "@/utils/precomputedDataLoader";
import type { Granularity } from "@/utils/dataAnalysis";
import type { PerformanceWithStoreBreakdown } from "@/types/analysis";

interface StoresTabProps {
  data: PrecomputedData;
}

import { formatCurrency } from "@/lib/utils";

export function StoresTab({ data }: StoresTabProps) {
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
            <CardTitle>Store trends</CardTitle>
            <div className="flex gap-2">
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
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Revenue over time for top 25 stores.
          </p>
        </CardHeader>
        <CardContent>
          <MultiSeriesTrendChart data={trendData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Store performance by product</CardTitle>
          <p className="text-sm text-muted-foreground">
            Top stores with revenue and product breakdown.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium">Store</th>
                  <th className="text-right py-2 px-4 font-medium">Revenue</th>
                  <th className="text-left py-2 pl-4 font-medium">Top products</th>
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
                        ` +${row.stores.length - 5} more`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {performance.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">
              No store performance data.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
