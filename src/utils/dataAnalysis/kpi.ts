/**
 * KPI and trend calculations.
 */
import type { SalesRecord } from "@/types/data";
import type { KPIMetrics, TimeSeriesData } from "@/types/analysis";
import { transactionKey, parseDateKey, getDateKey } from "./dateUtils";
import type { Granularity } from "@/types/analysis";

export function calculateKPIs(salesData: SalesRecord[]): KPIMetrics {
  const totalRevenue = salesData.reduce((sum, r) => sum + r.totalCost, 0);
  const transactionIds = new Set(salesData.map(transactionKey));
  const totalTransactions = transactionIds.size;
  const averageOrderValue =
    totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  const activeCustomers = new Set(salesData.map((r) => r.memberId)).size;
  return {
    totalRevenue,
    totalTransactions,
    averageOrderValue,
    activeCustomers,
  };
}

export function getTrendsByGranularity(
  salesData: SalesRecord[],
  granularity: Granularity,
): TimeSeriesData[] {
  const dataMap = new Map<
    string,
    { revenue: number; transactions: Set<string>; customers: Set<string> }
  >();

  salesData.forEach((record) => {
    if (!record.purchaseDate || record.totalCost <= 0) return;
    const date = parseDateKey(record.purchaseDate);
    if (!date) return;
    const key = getDateKey(date, granularity);
    if (!dataMap.has(key)) {
      dataMap.set(key, {
        revenue: 0,
        transactions: new Set(),
        customers: new Set(),
      });
    }
    const d = dataMap.get(key)!;
    d.revenue += record.totalCost;
    d.transactions.add(transactionKey(record));
    d.customers.add(record.memberId);
  });

  return Array.from(dataMap.entries())
    .map(([date, data]) => ({
      date,
      revenue: data.revenue,
      transactions: data.transactions.size,
      customers: data.customers.size,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
