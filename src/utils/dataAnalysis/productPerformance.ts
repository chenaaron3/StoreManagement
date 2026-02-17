/**
 * Product, category, collection, color, size performance and trends.
 */
import type { SalesRecord } from "@/types/data";
import type {
  ProductTrend,
  AttributeTrend,
  CollectionTrend,
  PerformanceWithStoreBreakdown,
} from "@/types/analysis";
import type { Granularity } from "@/types/analysis";
import { transactionKey, parseDateKey, getDateKey } from "./dateUtils";

function getTopProducts(
  salesData: SalesRecord[],
  limit: number = 20,
): { productName: string; productCode: string; revenue: number; quantity: number; transactions: number; averagePrice: number }[] {
  const productMap = new Map<
    string,
    { revenue: number; quantity: number; transactions: Set<string>; productCode: string; productName: string }
  >();
  salesData.forEach((sale) => {
    const productId = sale.productId ?? sale.itemId;
    const productName = sale.productName ?? sale.itemName;
    const key = productId?.trim() || "";
    if (!key || sale.totalCost <= 0) return;
    if (!productMap.has(key)) {
      productMap.set(key, {
        revenue: 0,
        quantity: 0,
        transactions: new Set(),
        productCode: productId ?? "",
        productName: productName?.trim() || (productId ?? ""),
      });
    }
    const p = productMap.get(key)!;
    p.revenue += sale.totalCost;
    p.quantity += sale.quantity;
    p.transactions.add(transactionKey(sale));
  });
  return Array.from(productMap.entries())
    .map(([, data]) => ({
      productName: data.productName,
      productCode: data.productCode,
      revenue: data.revenue,
      quantity: data.quantity,
      transactions: data.transactions.size,
      averagePrice: data.quantity > 0 ? data.revenue / data.quantity : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export { getTopProducts };

export function getProductTrends(
  salesData: SalesRecord[],
  topN: number = 10,
  granularity: Granularity = "monthly",
): ProductTrend[] {
  const topProducts = getTopProducts(salesData, topN);
  const topNames = new Set(topProducts.map((p) => p.productName));
  const trendMap = new Map<string, Map<string, number>>();

  salesData.forEach((record) => {
    const name =
      record.productName ??
      record.itemName ??
      record.productId ??
      record.itemId;
    if (!name || !topNames.has(name) || record.totalCost <= 0) return;
    const date = parseDateKey(record.purchaseDate);
    if (!date) return;
    const key = getDateKey(date, granularity);
    if (!trendMap.has(key)) trendMap.set(key, new Map());
    const pm = trendMap.get(key)!;
    pm.set(name, (pm.get(name) || 0) + record.totalCost);
  });

  const sortedDates = Array.from(trendMap.keys()).sort();
  return sortedDates.map((date) => {
    const entry: ProductTrend = { date };
    topNames.forEach((name) => (entry[name] = trendMap.get(date)!.get(name) || 0));
    return entry;
  });
}

export function getProductPerformanceWithStores(
  salesData: SalesRecord[],
  topN: number = 10,
): PerformanceWithStoreBreakdown[] {
  const topProducts = getTopProducts(salesData, topN);
  const topNames = new Set(topProducts.map((p) => p.productName));
  const productStoreMap = new Map<
    string,
    { totalRevenue: number; stores: Map<string, number> }
  >();

  salesData.forEach((sale) => {
    const name =
      sale.productName ?? sale.itemName ?? sale.productId ?? sale.itemId;
    if (!name || !topNames.has(name) || !sale.storeName?.trim() || sale.totalCost <= 0) return;
    const storeName = sale.storeName.trim();
    if (!productStoreMap.has(name)) {
      productStoreMap.set(name, { totalRevenue: 0, stores: new Map() });
    }
    const d = productStoreMap.get(name)!;
    d.totalRevenue += sale.totalCost;
    d.stores.set(storeName, (d.stores.get(storeName) || 0) + sale.totalCost);
  });

  return Array.from(productStoreMap.entries())
    .map(([name, data]) => ({
      name,
      totalRevenue: data.totalRevenue,
      stores: Array.from(data.stores.entries())
        .map(([storeName, revenue]) => ({ storeName, revenue }))
        .sort((a, b) => b.revenue - a.revenue),
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}

export function getCategoryPerformanceWithStores(
  salesData: SalesRecord[],
  topN: number = 25,
): PerformanceWithStoreBreakdown[] {
  const categoryMap = new Map<string, { revenue: number }>();
  salesData.forEach((sale) => {
    if (sale.totalCost <= 0) return;
    const cat = sale.productName ?? sale.itemName ?? "その他";
    categoryMap.set(cat, { revenue: (categoryMap.get(cat)?.revenue ?? 0) + sale.totalCost });
  });
  const topCats = Array.from(categoryMap.entries())
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, topN)
    .map(([name]) => name);
  const topSet = new Set(topCats);
  const resultMap = new Map<string, { totalRevenue: number; stores: Map<string, number> }>();
  salesData.forEach((sale) => {
    const cat = sale.productName ?? sale.itemName ?? "その他";
    if (!topSet.has(cat) || !sale.storeName?.trim() || sale.totalCost <= 0) return;
    const storeName = sale.storeName.trim();
    if (!resultMap.has(cat)) resultMap.set(cat, { totalRevenue: 0, stores: new Map() });
    const d = resultMap.get(cat)!;
    d.totalRevenue += sale.totalCost;
    d.stores.set(storeName, (d.stores.get(storeName) || 0) + sale.totalCost);
  });
  return Array.from(resultMap.entries())
    .map(([name, data]) => ({
      name,
      totalRevenue: data.totalRevenue,
      stores: Array.from(data.stores.entries())
        .map(([storeName, revenue]) => ({ storeName, revenue }))
        .sort((a, b) => b.revenue - a.revenue),
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}

export function getCollectionPerformanceWithStores(
  salesData: SalesRecord[],
  topN: number = 10,
): PerformanceWithStoreBreakdown[] {
  const brandMap = new Map<string, number>();
  salesData.forEach((sale) => {
    if (sale.totalCost <= 0) return;
    const b = sale.brandId ?? sale.brandCode ?? "その他";
    brandMap.set(b, (brandMap.get(b) || 0) + sale.totalCost);
  });
  const topBrands = Array.from(brandMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([n]) => n);
  const topSet = new Set(topBrands);
  const resultMap = new Map<string, { totalRevenue: number; stores: Map<string, number> }>();
  salesData.forEach((sale) => {
    const b = sale.brandId ?? sale.brandCode ?? "その他";
    if (!topSet.has(b) || !sale.storeName?.trim() || sale.totalCost <= 0) return;
    const storeName = sale.storeName.trim();
    if (!resultMap.has(b)) resultMap.set(b, { totalRevenue: 0, stores: new Map() });
    const d = resultMap.get(b)!;
    d.totalRevenue += sale.totalCost;
    d.stores.set(storeName, (d.stores.get(storeName) || 0) + sale.totalCost);
  });
  return Array.from(resultMap.entries())
    .map(([name, data]) => ({
      name,
      totalRevenue: data.totalRevenue,
      stores: Array.from(data.stores.entries())
        .map(([storeName, revenue]) => ({ storeName, revenue }))
        .sort((a, b) => b.revenue - a.revenue),
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}

export function getColorPerformanceWithStores(
  salesData: SalesRecord[],
  topN: number = 25,
): PerformanceWithStoreBreakdown[] {
  const colorStoreMap = new Map<string, { totalRevenue: number; stores: Map<string, number> }>();
  salesData.forEach((sale) => {
    const color = sale.color || "その他";
    if (!sale.storeName?.trim() || sale.totalCost <= 0) return;
    const storeName = sale.storeName.trim();
    if (!colorStoreMap.has(color)) {
      colorStoreMap.set(color, { totalRevenue: 0, stores: new Map() });
    }
    const d = colorStoreMap.get(color)!;
    d.totalRevenue += sale.totalCost;
    d.stores.set(storeName, (d.stores.get(storeName) || 0) + sale.totalCost);
  });
  return Array.from(colorStoreMap.entries())
    .map(([name, data]) => ({
      name,
      totalRevenue: data.totalRevenue,
      stores: Array.from(data.stores.entries())
        .map(([storeName, revenue]) => ({ storeName, revenue }))
        .sort((a, b) => b.revenue - a.revenue),
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, topN);
}

export function getSizePerformanceWithStores(
  salesData: SalesRecord[],
  topN: number = 25,
): PerformanceWithStoreBreakdown[] {
  const sizeStoreMap = new Map<string, { totalRevenue: number; stores: Map<string, number> }>();
  salesData.forEach((sale) => {
    const size = sale.size || "その他";
    if (!sale.storeName?.trim() || sale.totalCost <= 0) return;
    const storeName = sale.storeName.trim();
    if (!sizeStoreMap.has(size)) {
      sizeStoreMap.set(size, { totalRevenue: 0, stores: new Map() });
    }
    const d = sizeStoreMap.get(size)!;
    d.totalRevenue += sale.totalCost;
    d.stores.set(storeName, (d.stores.get(storeName) || 0) + sale.totalCost);
  });
  return Array.from(sizeStoreMap.entries())
    .map(([name, data]) => ({
      name,
      totalRevenue: data.totalRevenue,
      stores: Array.from(data.stores.entries())
        .map(([storeName, revenue]) => ({ storeName, revenue }))
        .sort((a, b) => b.revenue - a.revenue),
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, topN);
}

export function getAttributeTrends(
  salesData: SalesRecord[],
  attribute: "color" | "size",
  granularity: Granularity = "monthly",
): AttributeTrend[] {
  const attributeMap = new Map<string, Map<string, number>>();
  salesData.forEach((record) => {
    const date = parseDateKey(record.purchaseDate);
    if (!date || record.totalCost <= 0) return;
    const periodKey = getDateKey(date, granularity);
    const value = attribute === "color" ? record.color || "その他" : record.size || "その他";
    if (!attributeMap.has(periodKey)) attributeMap.set(periodKey, new Map());
    const pm = attributeMap.get(periodKey)!;
    pm.set(value, (pm.get(value) || 0) + record.quantity);
  });
  const allAttributes = new Set<string>();
  attributeMap.forEach((pm) => pm.forEach((_, attr) => allAttributes.add(attr)));
  return Array.from(attributeMap.entries())
    .map(([date, pm]) => {
      const entry: AttributeTrend = { date };
      allAttributes.forEach((attr) => (entry[attr] = pm.get(attr) || 0));
      return entry;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getCollectionTrends(
  salesData: SalesRecord[],
  topN: number = 10,
  granularity: Granularity = "monthly",
): CollectionTrend[] {
  const brandMap = new Map<string, number>();
  salesData.forEach((sale) => {
    if (sale.totalCost <= 0) return;
    const b = sale.brandId ?? sale.brandCode ?? "その他";
    brandMap.set(b, (brandMap.get(b) || 0) + sale.totalCost);
  });
  const topBrands = Array.from(brandMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([n]) => n);
  const topSet = new Set(topBrands);
  const trendMap = new Map<string, Map<string, number>>();
  salesData.forEach((record) => {
    const b = record.brandId ?? record.brandCode ?? "その他";
    if (!topSet.has(b) || record.totalCost <= 0) return;
    const date = parseDateKey(record.purchaseDate);
    if (!date) return;
    const key = getDateKey(date, granularity);
    if (!trendMap.has(key)) trendMap.set(key, new Map());
    const pm = trendMap.get(key)!;
    pm.set(b, (pm.get(b) || 0) + record.totalCost);
  });
  const sortedDates = Array.from(trendMap.keys()).sort();
  return sortedDates.map((date) => {
    const entry: CollectionTrend = { date };
    topSet.forEach((name) => (entry[name] = trendMap.get(date)!.get(name) || 0));
    return entry;
  });
}

export function getCategoryTrends(
  salesData: SalesRecord[],
  topN: number = 25,
  granularity: Granularity = "monthly",
): CollectionTrend[] {
  const categoryMap = new Map<string, number>();
  salesData.forEach((sale) => {
    if (sale.totalCost <= 0) return;
    const cat = sale.productName ?? sale.itemName ?? "その他";
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + sale.totalCost);
  });
  const topCats = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([n]) => n);
  const topSet = new Set(topCats);
  const trendMap = new Map<string, Map<string, number>>();
  salesData.forEach((record) => {
    const cat = record.productName ?? record.itemName ?? "その他";
    if (!topSet.has(cat) || record.totalCost <= 0) return;
    const date = parseDateKey(record.purchaseDate);
    if (!date) return;
    const key = getDateKey(date, granularity);
    if (!trendMap.has(key)) trendMap.set(key, new Map());
    const pm = trendMap.get(key)!;
    pm.set(cat, (pm.get(cat) || 0) + record.totalCost);
  });
  const sortedDates = Array.from(trendMap.keys()).sort();
  return sortedDates.map((date) => {
    const entry: CollectionTrend = { date };
    topSet.forEach((name) => (entry[name] = trendMap.get(date)!.get(name) || 0));
    return entry;
  });
}
