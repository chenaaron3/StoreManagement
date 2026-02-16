import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const [granularity, setGranularity] = useState<Granularity>("monthly");

  const trendData =
    granularity === "weekly"
      ? data.trendDataWeekly
      : data.trendDataMonthly;

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title={t("salesTab.totalRevenue")} value={data.kpis.totalRevenue} format="currency" />
        <KPICard title={t("salesTab.transactions")} value={data.kpis.totalTransactions} format="number" />
        <KPICard title={t("salesTab.averageOrderValue")} value={data.kpis.averageOrderValue} format="currency" />
        <KPICard title={t("salesTab.activeCustomers")} value={data.kpis.activeCustomers} format="number" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle>{t("salesTab.salesTrends")}</CardTitle>
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
                  {t(`salesTab.${g}`)}
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
