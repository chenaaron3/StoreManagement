import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DayOfWeekChart } from '@/components/DayOfWeekChart';
import { KPICard } from '@/components/KPICard';
import { TrendChart } from '@/components/TrendChart';
import { ButtonGroup } from '@/components/ui/button-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { filterByDateRange } from '@/utils/dateRangeFilter';

import { SalesRankingList } from './SalesRankingList';
import { StoreSalesTrendChart } from './StoreSalesTrendChart';

import type { PrecomputedData } from "@/utils/precomputedDataLoader";
import type { Granularity } from "@/types/analysis";
import type { DateRange } from "react-day-picker";

interface SalesTabProps {
  data: PrecomputedData;
}

type TimeRange = "allDay" | "allWeek" | "allMonth" | "allYear";

export function SalesTab({ data }: SalesTabProps) {
  const { t } = useTranslation();
  const [granularity, setGranularity] = useState<Granularity>("monthly");
  const [timeRange, setTimeRange] = useState<TimeRange>("allMonth");
  const [dateRange] = useState<DateRange | undefined>(() => {
    const now = new Date();
    return {
      from: new Date(now.getFullYear(), 0, 1),
      to: new Date(now.getFullYear(), 11, 31),
    };
  });

  const trendDataRaw =
    granularity === "weekly" ? data.trendDataWeekly : data.trendDataMonthly;

  const trendData = useMemo(() => {
    if (timeRange !== "allYear" || !dateRange?.from) return trendDataRaw;
    const g = granularity === "weekly" ? "weekly" : "monthly";
    return filterByDateRange(trendDataRaw, dateRange, g);
  }, [trendDataRaw, dateRange, timeRange, granularity]);

  const dayOfWeekData = useMemo(() => {
    if (timeRange !== "allYear" || !dateRange?.from) return data.dayOfWeekData;
    return data.dayOfWeekData;
  }, [data.dayOfWeekData, dateRange, timeRange]);

  const { weekRatio, dayRatio, aovRatio, customersRatio } = useMemo(() => ({
    weekRatio: { label: t("salesTab.weekRatio"), value: 3, direction: "up" as const },
    dayRatio: { label: t("salesTab.dayRatio"), value: 1, direction: "up" as const },
    aovRatio: { label: t("salesTab.dayRatio"), value: 3, direction: "down" as const },
    customersRatio: { label: t("salesTab.dayRatio"), value: 1, direction: "down" as const },
  }), [t]);

  const revenueSparkline = useMemo(() => ({
    data: trendDataRaw.slice(-12).map((d) => ({ value: d.revenue })),
  }), [trendDataRaw]);

  const aovSparkline = useMemo(() => ({
    data: trendDataRaw.slice(-12).map((d) => ({
      value: d.transactions ? d.revenue / d.transactions : 0,
    })),
  }), [trendDataRaw]);

  const customersSparkline = useMemo(() => ({
    data: trendDataRaw.slice(-12).map((d) => ({ value: d.customers ?? 0 })),
  }), [trendDataRaw]);

  const rankingItems = useMemo(() => {
    const stores = (data.storePerformanceWithProducts ?? []) as { name: string; totalRevenue: number }[];
    return stores.slice(0, 7).map((s, i) => ({
      rank: i + 1,
      name: s.name.length > 30 ? `${s.name.slice(0, 30)}…` : s.name,
      value: s.totalRevenue,
    }));
  }, [data.storePerformanceWithProducts]);

  const storeTrendData = useMemo(() => {
    const raw = granularity === "weekly" ? data.storeTrendsWeekly : data.storeTrendsMonthly;
    const arr = (raw ?? []) as { date: string;[k: string]: string | number }[];
    const g = granularity === "weekly" ? "weekly" : "monthly";
    const filtered =
      timeRange === "allYear" && dateRange?.from
        ? filterByDateRange(arr, dateRange, g)
        : arr;
    if (!filtered.length) return [];
    const keys = Object.keys(filtered[0] ?? {}).filter((k) => k !== "date");
    const topStores = keys.slice(0, 2);
    return filtered.map((row) => {
      const out: Record<string, string | number> = { date: row.date };
      topStores.forEach((k) => {
        out[k] = row[k] ?? 0;
      });
      return out;
    });
  }, [data.storeTrendsWeekly, data.storeTrendsMonthly, granularity, dateRange, timeRange]);

  const storeTrendKeys = useMemo(() => {
    const raw = granularity === "weekly" ? data.storeTrendsWeekly : data.storeTrendsMonthly;
    const arr = (raw ?? []) as { date: string;[k: string]: string | number }[];
    if (!arr.length) return [];
    return Object.keys(arr[0] ?? {}).filter((k) => k !== "date").slice(0, 2);
  }, [data.storeTrendsWeekly, data.storeTrendsMonthly, granularity]);

  const handleTimeRange = (tr: TimeRange) => {
    setTimeRange(tr);
    if (tr === "allWeek") setGranularity("weekly");
    if (tr === "allMonth" || tr === "allYear") setGranularity("monthly");
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <ButtonGroup className="gap-1">
          {(["allDay", "allWeek", "allMonth", "allYear"] as const).map((tr) => (
            <button
              key={tr}
              type="button"
              onClick={() => handleTimeRange(tr)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${timeRange === tr ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
            >
              {t(`salesTab.${tr}`)}
            </button>
          ))}
        </ButtonGroup>
      </div>

      <>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title={t("salesTab.totalRevenue")}
            value={data.kpis.totalRevenue}
            format="currency"
            info={t("salesTab.totalRevenue")}
            ratio={weekRatio}
            sparkline={revenueSparkline}
          />
          <KPICard
            title={t("salesTab.transactions")}
            value={data.kpis.totalTransactions}
            format="number"
            info={t("salesTab.transactions")}
            ratio={dayRatio}
            sparkline={{ data: trendDataRaw.slice(-12).map((d) => ({ value: d.transactions })) }}
          />
          <KPICard
            title={t("salesTab.averageOrderValue")}
            value={data.kpis.averageOrderValue}
            format="currency"
            ratio={aovRatio}
            sparkline={aovSparkline}
          />
          <KPICard
            title={t("salesTab.activeCustomers")}
            value={data.kpis.activeCustomers}
            format="number"
            ratio={customersRatio}
            sparkline={customersSparkline}
          />
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <CardTitle>{t("salesTab.salesTrends")}</CardTitle>
                <div className="flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-0.5 tabular-nums text-green-600 dark:text-green-400">
                    {t("salesTab.weekRatio")} 3% ▲
                  </span>
                  <span className="inline-flex items-center gap-0.5 tabular-nums text-green-600 dark:text-green-400">
                    {t("salesTab.dayRatio")} 1% ▲
                  </span>
                </div>
              </div>
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
          </CardHeader>
          <CardContent>
            <TrendChart data={trendData} granularity={granularity} />
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="flex min-h-0 h-full lg:col-span-2">
            <StoreSalesTrendChart
              className="min-h-0 h-full flex-1"
              data={storeTrendData as { date: string;[key: string]: string | number }[]}
              seriesKeys={storeTrendKeys}
              granularity={granularity === "weekly" ? "weekly" : "monthly"}
            />
          </div>
          <Card>
            <CardContent className="pt-6">
              <SalesRankingList
                items={rankingItems}
                valueFormatter={(v) => formatCurrency(v)}
              />
            </CardContent>
          </Card>
        </div>

        <DayOfWeekChart data={dayOfWeekData} />
      </>
    </>
  );
}
