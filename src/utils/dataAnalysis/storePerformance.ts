/**
 * Store performance and trends.
 */
import type { SalesRecord } from "@/types/data";
import type { StorePerformance, StoreTrend, PerformanceWithStoreBreakdown } from "@/types/analysis";
import type { Granularity } from "@/types/analysis";
import { transactionKey, parseDateKey, getDateKey } from "./dateUtils";
import { getTopProducts } from "./productPerformance";

export function getStorePerformance(
  salesData: SalesRecord[],
): StorePerformance[] {
  const storeMap = new Map<
    string,
    { revenue: number; transactions: Set<string>; customers: Set<string>; storeCode: string }
  >();
  salesData.forEach((sale) => {
    const name = sale.storeName?.trim() || "";
    if (!name || sale.totalCost <= 0) return;
    if (!storeMap.has(name)) {
      storeMap.set(name, {
        revenue: 0,
        transactions: new Set(),
        customers: new Set(),
        storeCode: "",
      });
    }
    const s = storeMap.get(name)!;
    s.revenue += sale.totalCost;
    s.transactions.add(transactionKey(sale));
    s.customers.add(sale.memberId);
  });
  return Array.from(storeMap.entries())
    .map(([storeName, data]) => ({
      storeName,
      storeCode: data.storeCode,
      revenue: data.revenue,
      transactions: data.transactions.size,
      customers: data.customers.size,
      averageOrderValue:
        data.transactions.size > 0 ? data.revenue / data.transactions.size : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function getStorePerformanceWithProducts(
  salesData: SalesRecord[],
  topN: number = 10,
): PerformanceWithStoreBreakdown[] {
  const topStores = getStorePerformance(salesData).slice(0, topN);
  const topStoreNames = new Set(topStores.map((s) => s.storeName));
  const topProducts = getTopProducts(salesData, 20);
  const topProductNames = new Set(topProducts.map((p) => p.productName));
  const storeProductMap = new Map<
    string,
    { totalRevenue: number; stores: Map<string, number> }
  >();

  salesData.forEach((sale) => {
    const storeName = sale.storeName?.trim() || "";
    const productName =
      sale.productName ?? sale.itemName ?? sale.productId ?? sale.itemId;
    if (
      !storeName ||
      !topStoreNames.has(storeName) ||
      !productName ||
      !topProductNames.has(productName) ||
      sale.totalCost <= 0
    )
      return;
    if (!storeProductMap.has(storeName)) {
      storeProductMap.set(storeName, { totalRevenue: 0, stores: new Map() });
    }
    const d = storeProductMap.get(storeName)!;
    d.totalRevenue += sale.totalCost;
    d.stores.set(productName, (d.stores.get(productName) || 0) + sale.totalCost);
  });

  return Array.from(storeProductMap.entries())
    .map(([name, data]) => ({
      name,
      totalRevenue: data.totalRevenue,
      stores: Array.from(data.stores.entries())
        .map(([productName, revenue]) => ({ storeName: productName, revenue }))
        .sort((a, b) => b.revenue - a.revenue),
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}

export function getStoreTrends(
  salesData: SalesRecord[],
  topN: number = 10,
  granularity: Granularity = "monthly",
): StoreTrend[] {
  const topStores = getStorePerformance(salesData).slice(0, topN);
  const topStoreNames = new Set(topStores.map((s) => s.storeName));
  const trendMap = new Map<string, Map<string, number>>();

  salesData.forEach((record) => {
    const storeName = record.storeName?.trim() || "";
    if (!storeName || !topStoreNames.has(storeName) || record.totalCost <= 0)
      return;
    const date = parseDateKey(record.purchaseDate);
    if (!date) return;
    const key = getDateKey(date, granularity);
    if (!trendMap.has(key)) trendMap.set(key, new Map());
    const pm = trendMap.get(key)!;
    pm.set(storeName, (pm.get(storeName) || 0) + record.totalCost);
  });

  const sortedDates = Array.from(trendMap.keys()).sort();
  return sortedDates.map((date) => {
    const entry: StoreTrend = { date };
    topStoreNames.forEach(
      (name) => (entry[name] = trendMap.get(date)!.get(name) || 0),
    );
    return entry;
  });
}
