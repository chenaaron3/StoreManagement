import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/KPICard";
import { TrendChart } from "@/components/TrendChart";
import { DayOfWeekChart } from "@/components/DayOfWeekChart";
import type { PrecomputedData } from "@/utils/precomputedDataLoader";
import type { Granularity } from "@/utils/dataAnalysis";

interface SalesTabProps {
  data: PrecomputedData;
}

export function SalesTab({ data }: SalesTabProps) {
  const [granularity, setGranularity] = useState<Granularity>("monthly");

  const trendData =
    granularity === "weekly"
      ? data.trendDataWeekly
      : data.trendDataMonthly;

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total revenue" value={data.kpis.totalRevenue} format="currency" />
        <KPICard title="Transactions" value={data.kpis.totalTransactions} format="number" />
        <KPICard title="Average order value" value={data.kpis.averageOrderValue} format="currency" />
        <KPICard title="Active customers" value={data.kpis.activeCustomers} format="number" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle>Sales trends</CardTitle>
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
          </div>
        </CardHeader>
        <CardContent>
          <TrendChart data={trendData} granularity={granularity} />
        </CardContent>
      </Card>

      <DayOfWeekChart data={data.dayOfWeekData} />
    </>
  );
}
