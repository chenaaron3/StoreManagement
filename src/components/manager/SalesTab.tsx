import { Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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

export type TimeRange = "allDay" | "allWeek" | "allMonth" | "allYear";

interface SalesTabTimeRangeProps {
  value: TimeRange;
  onChange: (v: TimeRange) => void;
}

export function SalesTabTimeRange({ value, onChange }: SalesTabTimeRangeProps) {
  const { t } = useTranslation();
  return (
    <ButtonGroup className="gap-1">
      {(["allDay", "allWeek", "allMonth", "allYear"] as const).map((tr) => (
        <button
          key={tr}
          type="button"
          onClick={() => onChange(tr)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${value === tr ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
        >
          {t(`salesTab.${tr}`)}
        </button>
      ))}
    </ButtonGroup>
  );
}

interface SalesTabProps {
  data: PrecomputedData;
  timeRange?: TimeRange;
  onTimeRangeChange?: (v: TimeRange) => void;
}

export function SalesTab({ data, timeRange: timeRangeProp }: SalesTabProps) {
  const { t } = useTranslation();
  const [internalTimeRange] = useState<TimeRange>("allMonth");
  const timeRange = timeRangeProp ?? internalTimeRange;
  const [granularity, setGranularity] = useState<Granularity>("monthly");
  useEffect(() => {
    if (timeRange === "allWeek") setGranularity("weekly");
    else if (timeRange === "allMonth" || timeRange === "allYear") setGranularity("monthly");
  }, [timeRange]);
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

  const aiNextWeekForecast = useMemo(() => {
    const lastWeek = trendDataRaw.slice(-1)[0];
    const base = lastWeek?.revenue ?? data.kpis.totalRevenue / 52;
    return Math.round(base * 1.05);
  }, [trendDataRaw, data.kpis.totalRevenue]);

  const aiOptimalShift = useMemo(() => {
    const dow = (data.dayOfWeekData ?? []) as { day: string; revenue: number }[];
    if (!dow.length) return "土曜";
    const best = dow.reduce((a, b) => (b.revenue > a.revenue ? b : a), dow[0]);
    const dayMap: Record<string, string> = {
      Sun: "日曜", Mon: "月曜", Tue: "火曜", Wed: "水曜",
      Thu: "木曜", Fri: "金曜", Sat: "土曜",
    };
    return dayMap[best.day] ?? best.day ?? "土曜";
  }, [data.dayOfWeekData]);

  const [aiModalOpen, setAiModalOpen] = useState(false);

  return (
    <>
      <Card className="border-primary/30 bg-primary/5 py-4 gap-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pb-1 pt-0">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <CardTitle className="text-base">AI予測</CardTitle>
          </div>
          <button
            type="button"
            onClick={() => setAiModalOpen(true)}
            className="rounded-lg border border-primary bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors shrink-0"
          >
            AIマーケティング
          </button>
        </CardHeader>
        <CardContent className="px-4 pt-0">
          <div className="grid gap-4 sm:grid-cols-2">
            <KPICard
              title="来週の売上予測"
              value={aiNextWeekForecast}
              format="currency"
              ratio={{ label: t("salesTab.weekRatio"), value: 5, direction: "up" }}
            />
            <KPICard
              title="最適シフト"
              value={`${aiOptimalShift} 重点配置`}
              info="曜日別売上より算出"
            />
          </div>
        </CardContent>
      </Card>

      {aiModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setAiModalOpen(false)}
        >
          <div
            className="mx-4 max-w-md rounded-lg border bg-card p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">AIマーケティング</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Sランク顧客向けクーポン配信
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
              >
                Seeds に送信
              </button>
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

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
  );
}
