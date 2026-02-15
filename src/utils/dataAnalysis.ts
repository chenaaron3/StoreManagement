/**
 * Analytics functions for sales_analytics (clothing, multi-brand).
 * Adapted from sales repo: uses totalCost, derived transaction key, no birthday/anniversary.
 */
import type { SalesRecord } from "@/types/data";
import type {
  KPIMetrics,
  TimeSeriesData,
  ProductTrend,
  AttributeTrend,
  CustomerSegment,
  DayOfWeekData,
  CustomerDetail,
  RFMSegment,
  RFMMatrixCell,
  PerformanceWithStoreBreakdown,
  CollectionTrend,
  StoreTrend,
  EmployeePerformance,
  BrandPerformance,
  ProductPerformance,
  StorePerformance,
} from "@/types/analysis";

/** Derive transaction key for KPIs (no transactionNumber in CSV). */
function transactionKey(r: SalesRecord): string {
  return `${r.purchaseDate}|${r.memberId}|${r.storeName}`;
}

function parseDateKey(dateStr: string): Date | null {
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
}

export type Granularity = "daily" | "weekly" | "monthly";

export function getDateKey(date: Date, granularity: Granularity): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  switch (granularity) {
    case "daily":
      return `${year}-${month}-${day}`;
    case "weekly": {
      const startOfYear = new Date(year, 0, 1);
      const daysDiff = Math.floor(
        (date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
      );
      const week = Math.floor(daysDiff / 7) + 1;
      return `${year}-W${String(week).padStart(2, "0")}`;
    }
    case "monthly":
      return `${year}-${month}`;
    default:
      return `${year}-${month}-${day}`;
  }
}

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
  granularity: Granularity
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
      dataMap.set(key, { revenue: 0, transactions: new Set(), customers: new Set() });
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

export function getCustomerDetails(salesData: SalesRecord[]): Map<string, CustomerDetail> {
  const customerMap = new Map<string, CustomerDetail>();
  const now = new Date();

  salesData.forEach((sale) => {
    if (sale.totalCost <= 0) return;
    const memberId = sale.memberId;
    const txKey = transactionKey(sale);
    if (!customerMap.has(memberId)) {
      customerMap.set(memberId, {
        memberId,
        totalRevenue: 0,
        transactionCount: 0,
        averageOrderValue: 0,
        firstPurchaseDate: sale.purchaseDate,
        lastPurchaseDate: sale.purchaseDate,
        daysSinceLastPurchase: 0,
        preferredStore: sale.storeName,
        preferredCategory: sale.productName ?? sale.itemName ?? "",
        isOnlineCustomer: false,
      });
    }
    const c = customerMap.get(memberId)!;
    c.totalRevenue += sale.totalCost;
    const cExt = c as CustomerDetail & { _txSet?: Set<string> };
    if (!cExt._txSet) cExt._txSet = new Set();
    cExt._txSet.add(txKey);

    if (sale.purchaseDate < c.firstPurchaseDate) c.firstPurchaseDate = sale.purchaseDate;
    if (sale.purchaseDate > c.lastPurchaseDate) c.lastPurchaseDate = sale.purchaseDate;
    if (sale.storeName?.toLowerCase().includes("online")) c.isOnlineCustomer = true;
  });

  customerMap.forEach((c) => {
    const cExt = c as CustomerDetail & { _txSet?: Set<string> };
    c.transactionCount = cExt._txSet ? cExt._txSet.size : 0;
    c.averageOrderValue = c.transactionCount > 0 ? c.totalRevenue / c.transactionCount : 0;
    const m = c.lastPurchaseDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      const last = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
      c.daysSinceLastPurchase = Math.floor(
        (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
      );
    }
  });

  return customerMap;
}

export function getTopProducts(
  salesData: SalesRecord[],
  limit: number = 20
): ProductPerformance[] {
  const productMap = new Map<
    string,
    {
      revenue: number;
      quantity: number;
      transactions: Set<string>;
      productCode: string;
      productName: string;
    }
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

export function getStorePerformance(salesData: SalesRecord[]): StorePerformance[] {
  const storeMap = new Map<
    string,
    { revenue: number; transactions: Set<string>; customers: Set<string>; storeCode: string }
  >();

  salesData.forEach((sale) => {
    const name = sale.storeName?.trim() || "";
    if (!name || sale.totalCost <= 0) return;
    if (!storeMap.has(name)) {
      storeMap.set(name, { revenue: 0, transactions: new Set(), customers: new Set(), storeCode: "" });
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

export function getDayOfWeekAnalysis(salesData: SalesRecord[]): DayOfWeekData[] {
  const dayMap = new Map<
    number,
    { revenue: number; transactions: Set<string>; customers: Set<string> }
  >();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  salesData.forEach((sale) => {
    if (!sale.purchaseDate || sale.totalCost <= 0) return;
    const date = parseDateKey(sale.purchaseDate);
    if (!date) return;
    const dayOfWeek = date.getDay();
    if (!dayMap.has(dayOfWeek)) {
      dayMap.set(dayOfWeek, { revenue: 0, transactions: new Set(), customers: new Set() });
    }
    const d = dayMap.get(dayOfWeek)!;
    d.revenue += sale.totalCost;
    d.transactions.add(transactionKey(sale));
    d.customers.add(sale.memberId);
  });

  return Array.from(dayMap.entries())
    .map(([dayNum, data]) => ({
      day: dayNames[dayNum],
      revenue: data.revenue,
      transactions: data.transactions.size,
      customers: data.customers.size,
    }))
    .sort((a, b) => dayNames.indexOf(a.day) - dayNames.indexOf(b.day));
}

export function getAttributeTrends(
  salesData: SalesRecord[],
  attribute: "color" | "size",
  granularity: Granularity = "monthly"
): AttributeTrend[] {
  const attributeMap = new Map<string, Map<string, number>>();

  salesData.forEach((record) => {
    const date = parseDateKey(record.purchaseDate);
    if (!date || record.totalCost <= 0) return;
    const periodKey = getDateKey(date, granularity);
    const value =
      attribute === "color" ? (record.color || "その他") : (record.size || "その他");
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

export function getCustomerSegments(salesData: SalesRecord[]): CustomerSegment[] {
  const customerMap = new Map<string, number>();
  salesData.forEach((sale) => {
    if (sale.totalCost <= 0) return;
    customerMap.set(
      sale.memberId,
      (customerMap.get(sale.memberId) || 0) + sale.totalCost
    );
  });
  const totalCustomers = customerMap.size;
  const segments: CustomerSegment[] = [
    { segment: "VIP (>¥100,000)", count: 0, totalRevenue: 0, averageRevenue: 0, percentage: 0 },
    { segment: "High Value (¥50,000-100,000)", count: 0, totalRevenue: 0, averageRevenue: 0, percentage: 0 },
    { segment: "Regular (¥20,000-50,000)", count: 0, totalRevenue: 0, averageRevenue: 0, percentage: 0 },
    { segment: "Occasional (<¥20,000)", count: 0, totalRevenue: 0, averageRevenue: 0, percentage: 0 },
  ];
  customerMap.forEach((revenue) => {
    if (revenue >= 100000) {
      segments[0].count++;
      segments[0].totalRevenue += revenue;
    } else if (revenue >= 50000) {
      segments[1].count++;
      segments[1].totalRevenue += revenue;
    } else if (revenue >= 20000) {
      segments[2].count++;
      segments[2].totalRevenue += revenue;
    } else {
      segments[3].count++;
      segments[3].totalRevenue += revenue;
    }
  });
  segments.forEach((s) => {
    s.averageRevenue = s.count > 0 ? s.totalRevenue / s.count : 0;
    s.percentage = totalCustomers > 0 ? (s.count / totalCustomers) * 100 : 0;
  });
  return segments;
}

// RFM (simplified: no member birthdate/age/gender - use getCustomerDetails only)
export function getRFMSegments(salesData: SalesRecord[]): RFMSegment[] {
  const customerDetails = getCustomerDetails(salesData);
  const customers = Array.from(customerDetails.values());
  if (customers.length === 0) return [];

  const monetaries = customers.map((c) => c.totalRevenue).sort((a, b) => a - b);

  const p = (arr: number[], q: number) => {
    if (arr.length === 0) return 0;
    const i = Math.floor(arr.length * q);
    return arr[Math.min(i, arr.length - 1)];
  };
  const m25 = p(monetaries, 0.25);
  const m50 = p(monetaries, 0.5);
  const m75 = p(monetaries, 0.75);

  const segmentMap = new Map<
    string,
    { count: number; revenue: number; description: string; rScore: number; fScore: number; mScore: number }
  >();

  const quartileSize = Math.ceil(customers.length / 4);
  const byRecency = [...customers].sort((a, b) => a.daysSinceLastPurchase - b.daysSinceLastPurchase);
  const byFreq = [...customers].sort((a, b) => b.transactionCount - a.transactionCount);
  const recencyIdx = new Map(byRecency.map((c, i) => [c.memberId, i]));
  const freqIdx = new Map(byFreq.map((c, i) => [c.memberId, i]));

  customers.forEach((customer) => {
    const rScore =
      (recencyIdx.get(customer.memberId) ?? 0) < quartileSize
        ? 4
        : (recencyIdx.get(customer.memberId) ?? 0) < quartileSize * 2
          ? 3
          : (recencyIdx.get(customer.memberId) ?? 0) < quartileSize * 3
            ? 2
            : 1;
    const fScore =
      (freqIdx.get(customer.memberId) ?? 0) < quartileSize
        ? 4
        : (freqIdx.get(customer.memberId) ?? 0) < quartileSize * 2
          ? 3
          : (freqIdx.get(customer.memberId) ?? 0) < quartileSize * 3
            ? 2
            : 1;
    const mScore =
      customer.totalRevenue >= m75 ? 4 : customer.totalRevenue >= m50 ? 3 : customer.totalRevenue >= m25 ? 2 : 1;

    let segment = "Hibernating";
    let description = "Inactive customers.";
    if (rScore >= 3 && fScore >= 3 && mScore >= 3) {
      segment = "Champions";
      description = "Best customers: recent, frequent, high spend.";
    } else if (rScore >= 3 && fScore <= 2 && mScore >= 3) {
      segment = "Potential Loyalists";
      description = "High value, recent, low frequency.";
    } else if (rScore <= 2 && fScore >= 3 && mScore >= 3) {
      segment = "At Risk";
      description = "Previously valuable, not recent.";
    } else if (rScore <= 2 && fScore <= 2 && mScore <= 2) {
      segment = "Lost";
      description = "Low value, inactive.";
    }

    if (!segmentMap.has(segment)) {
      segmentMap.set(segment, {
        count: 0,
        revenue: 0,
        description,
        rScore: 0,
        fScore: 0,
        mScore: 0,
      });
    }
    const seg = segmentMap.get(segment)!;
    seg.count++;
    seg.revenue += customer.totalRevenue;
    seg.rScore = (seg.rScore * (seg.count - 1) + rScore) / seg.count;
    seg.fScore = (seg.fScore * (seg.count - 1) + fScore) / seg.count;
    seg.mScore = (seg.mScore * (seg.count - 1) + mScore) / seg.count;
  });

  const totalCustomers = customers.length;
  return Array.from(segmentMap.entries())
    .map(([segment, data]) => ({
      segment,
      description: data.description,
      count: data.count,
      totalRevenue: data.revenue,
      averageRevenue: data.count > 0 ? data.revenue / data.count : 0,
      percentage: (data.count / totalCustomers) * 100,
      rScore: Math.round(data.rScore * 10) / 10,
      fScore: Math.round(data.fScore * 10) / 10,
      mScore: Math.round(data.mScore * 10) / 10,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}

export function getRFMMatrix(salesData: SalesRecord[]): RFMMatrixCell[] {
  const customerDetails = getCustomerDetails(salesData);
  const customers = Array.from(customerDetails.values());
  if (customers.length === 0) return [];

  const monetaries = customers.map((c) => c.totalRevenue).sort((a, b) => a - b);
  const p = (arr: number[], q: number) => {
    if (arr.length === 0) return 0;
    const i = Math.floor(arr.length * q);
    return arr[Math.min(i, arr.length - 1)];
  };
  const m25 = p(monetaries, 0.25);
  const m50 = p(monetaries, 0.5);
  const m75 = p(monetaries, 0.75);

  const matrixMap = new Map<
    string,
    { count: number; revenue: number; transactionCount: number; mScoreSum: number; segments: Set<string> }
  >();
  for (let r = 1; r <= 4; r++) {
    for (let f = 1; f <= 4; f++) {
      matrixMap.set(`${r}-${f}`, {
        count: 0,
        revenue: 0,
        transactionCount: 0,
        mScoreSum: 0,
        segments: new Set(),
      });
    }
  }

  const rfmSegments = getRFMSegments(salesData);
  const quartileSize = Math.ceil(customers.length / 4);
  const byRecency = [...customers].sort((a, b) => a.daysSinceLastPurchase - b.daysSinceLastPurchase);
  const byFreq = [...customers].sort((a, b) => b.transactionCount - a.transactionCount);
  const recencyIdx = new Map(byRecency.map((c, i) => [c.memberId, i]));
  const freqIdx = new Map(byFreq.map((c, i) => [c.memberId, i]));

  customers.forEach((customer) => {
    const rScore =
      (recencyIdx.get(customer.memberId) ?? 0) < quartileSize
        ? 4
        : (recencyIdx.get(customer.memberId) ?? 0) < quartileSize * 2
          ? 3
          : (recencyIdx.get(customer.memberId) ?? 0) < quartileSize * 3
            ? 2
            : 1;
    const fScore =
      (freqIdx.get(customer.memberId) ?? 0) < quartileSize
        ? 4
        : (freqIdx.get(customer.memberId) ?? 0) < quartileSize * 2
          ? 3
          : (freqIdx.get(customer.memberId) ?? 0) < quartileSize * 3
            ? 2
            : 1;
    const mScore =
      customer.totalRevenue >= m75 ? 4 : customer.totalRevenue >= m50 ? 3 : customer.totalRevenue >= m25 ? 2 : 1;
    const key = `${rScore}-${fScore}`;
    const cell = matrixMap.get(key)!;
    cell.count++;
    cell.revenue += customer.totalRevenue;
    cell.transactionCount += customer.transactionCount;
    cell.mScoreSum += mScore;
    rfmSegments.forEach((seg) => {
      const sr = Math.round(seg.rScore);
      const sf = Math.round(seg.fScore);
      if (sr === rScore && sf === fScore) cell.segments.add(seg.segment);
    });
  });

  const result: RFMMatrixCell[] = [];
  for (let r = 1; r <= 4; r++) {
    for (let f = 1; f <= 4; f++) {
      const cell = matrixMap.get(`${r}-${f}`)!;
      const segments = Array.from(cell.segments)
        .map((name) => rfmSegments.find((s) => s.segment === name))
        .filter((s): s is RFMSegment => s != null);
      result.push({
        rScore: r,
        fScore: f,
        count: cell.count,
        totalRevenue: cell.revenue,
        averageRevenue:
          cell.transactionCount > 0 ? cell.revenue / cell.transactionCount : 0,
        averageMScore: cell.count > 0 ? cell.mScoreSum / cell.count : 0,
        percentage: customers.length > 0 ? (cell.count / customers.length) * 100 : 0,
        segments,
      });
    }
  }
  return result;
}

export function getFrequencySegments(salesData: SalesRecord[]): CustomerSegment[] {
  const customerDetails = getCustomerDetails(salesData);
  const customers = Array.from(customerDetails.values());
  const segments: CustomerSegment[] = [
    { segment: "Very Frequent (10+ purchases)", count: 0, totalRevenue: 0, averageRevenue: 0, percentage: 0 },
    { segment: "Frequent (5-9 purchases)", count: 0, totalRevenue: 0, averageRevenue: 0, percentage: 0 },
    { segment: "Regular (2-4 purchases)", count: 0, totalRevenue: 0, averageRevenue: 0, percentage: 0 },
    { segment: "One-Time (1 purchase)", count: 0, totalRevenue: 0, averageRevenue: 0, percentage: 0 },
  ];
  const txCounts = [0, 0, 0, 0];
  customers.forEach((c) => {
    if (c.transactionCount >= 10) {
      segments[0].count++;
      segments[0].totalRevenue += c.totalRevenue;
      txCounts[0] += c.transactionCount;
    } else if (c.transactionCount >= 5) {
      segments[1].count++;
      segments[1].totalRevenue += c.totalRevenue;
      txCounts[1] += c.transactionCount;
    } else if (c.transactionCount >= 2) {
      segments[2].count++;
      segments[2].totalRevenue += c.totalRevenue;
      txCounts[2] += c.transactionCount;
    } else {
      segments[3].count++;
      segments[3].totalRevenue += c.totalRevenue;
      txCounts[3] += c.transactionCount;
    }
  });
  const total = customers.length;
  segments.forEach((s, i) => {
    s.averageRevenue = txCounts[i] > 0 ? s.totalRevenue / txCounts[i] : 0;
    s.percentage = total > 0 ? (s.count / total) * 100 : 0;
  });
  return segments;
}

export function getChannelSegments(salesData: SalesRecord[]): CustomerSegment[] {
  const storeMap = new Map<string, number>();
  salesData.forEach((sale) => {
    if (sale.totalCost <= 0) return;
    const channel = sale.storeName?.trim() || "Other";
    storeMap.set(channel, (storeMap.get(channel) || 0) + sale.totalCost);
  });
  const total = salesData.reduce((sum, s) => sum + (s.totalCost > 0 ? 1 : 0), 0);
  return Array.from(storeMap.entries())
    .map(([segment, totalRevenue]) => ({
      segment,
      count: 1,
      totalRevenue,
      averageRevenue: totalRevenue,
      percentage: total > 0 ? (1 / total) * 100 : 0,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10);
}

export function getAOVSegments(salesData: SalesRecord[]): CustomerSegment[] {
  const customerDetails = getCustomerDetails(salesData);
  const customers = Array.from(customerDetails.values());
  const buckets = [
    { segment: "High AOV (¥10,000+)", count: 0, totalRevenue: 0, averageRevenue: 0, percentage: 0 },
    { segment: "Medium AOV (¥5,000-10,000)", count: 0, totalRevenue: 0, averageRevenue: 0, percentage: 0 },
    { segment: "Standard AOV (¥2,000-5,000)", count: 0, totalRevenue: 0, averageRevenue: 0, percentage: 0 },
    { segment: "Low AOV (<¥2,000)", count: 0, totalRevenue: 0, averageRevenue: 0, percentage: 0 },
  ];
  customers.forEach((c) => {
    const aov = c.averageOrderValue;
    if (aov >= 10000) {
      buckets[0].count++;
      buckets[0].totalRevenue += c.totalRevenue;
    } else if (aov >= 5000) {
      buckets[1].count++;
      buckets[1].totalRevenue += c.totalRevenue;
    } else if (aov >= 2000) {
      buckets[2].count++;
      buckets[2].totalRevenue += c.totalRevenue;
    } else {
      buckets[3].count++;
      buckets[3].totalRevenue += c.totalRevenue;
    }
  });
  const total = customers.length;
  buckets.forEach((b) => {
    b.averageRevenue = b.count > 0 ? b.totalRevenue / b.count : 0;
    b.percentage = total > 0 ? (b.count / total) * 100 : 0;
  });
  return buckets;
}

export function getProductTrends(
  salesData: SalesRecord[],
  topN: number = 10,
  granularity: Granularity = "monthly"
): ProductTrend[] {
  const topProducts = getTopProducts(salesData, topN);
  const topNames = new Set(topProducts.map((p) => p.productName));
  const trendMap = new Map<string, Map<string, number>>();

  salesData.forEach((record) => {
    const name = record.productName ?? record.itemName ?? record.productId ?? record.itemId;
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
  topN: number = 10
): PerformanceWithStoreBreakdown[] {
  const topProducts = getTopProducts(salesData, topN);
  const topNames = new Set(topProducts.map((p) => p.productName));
  const productStoreMap = new Map<string, { totalRevenue: number; stores: Map<string, number> }>();

  salesData.forEach((sale) => {
    const name = sale.productName ?? sale.itemName ?? sale.productId ?? sale.itemId;
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
  topN: number = 25
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
  topN: number = 10
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
  topN: number = 25
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
  topN: number = 25
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

export function getCollectionTrends(
  salesData: SalesRecord[],
  topN: number = 10,
  granularity: Granularity = "monthly"
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
  granularity: Granularity = "monthly"
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

export function getStorePerformanceWithProducts(
  salesData: SalesRecord[],
  topN: number = 10
): PerformanceWithStoreBreakdown[] {
  const topStores = getStorePerformance(salesData).slice(0, topN);
  const topStoreNames = new Set(topStores.map((s) => s.storeName));
  const topProducts = getTopProducts(salesData, 20);
  const topProductNames = new Set(topProducts.map((p) => p.productName));
  const storeProductMap = new Map<string, { totalRevenue: number; stores: Map<string, number> }>();

  salesData.forEach((sale) => {
    const storeName = sale.storeName?.trim() || "";
    const productName = sale.productName ?? sale.itemName ?? sale.productId ?? sale.itemId;
    if (!storeName || !topStoreNames.has(storeName) || !productName || !topProductNames.has(productName) || sale.totalCost <= 0)
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
  granularity: Granularity = "monthly"
): StoreTrend[] {
  const topStores = getStorePerformance(salesData).slice(0, topN);
  const topStoreNames = new Set(topStores.map((s) => s.storeName));
  const trendMap = new Map<string, Map<string, number>>();

  salesData.forEach((record) => {
    const storeName = record.storeName?.trim() || "";
    if (!storeName || !topStoreNames.has(storeName) || record.totalCost <= 0) return;
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
    topStoreNames.forEach((name) => (entry[name] = trendMap.get(date)!.get(name) || 0));
    return entry;
  });
}

export function getEmployeePerformance(
  salesData: SalesRecord[],
  _topN?: number
): EmployeePerformance[] {
  const employeeMap = new Map<
    string,
    { totalRevenue: number; products: Map<string, number>; stores: Set<string> }
  >();

  salesData.forEach((sale) => {
    if (sale.totalCost <= 0 || !sale.salesAssociate?.trim()) return;
    const key = sale.salesAssociate.trim();
    if (!employeeMap.has(key)) {
      employeeMap.set(key, { totalRevenue: 0, products: new Map(), stores: new Set() });
    }
    const e = employeeMap.get(key)!;
    e.totalRevenue += sale.totalCost;
    e.stores.add(sale.storeName?.trim() || "");
    const name = sale.productName ?? sale.itemName ?? sale.productId ?? sale.itemId ?? "";
    if (name) e.products.set(name, (e.products.get(name) || 0) + sale.totalCost);
  });

  return Array.from(employeeMap.entries())
    .map(([staffName, data]) => ({
      staffName,
      staffCode: staffName,
      totalRevenue: data.totalRevenue,
      stores: Array.from(data.stores).filter(Boolean).sort(),
      products: Array.from(data.products.entries())
        .map(([productName, revenue]) => ({ productName, revenue }))
        .sort((a, b) => b.revenue - a.revenue),
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}

export function getAgeSegments(_salesData: SalesRecord[]): CustomerSegment[] {
  return [];
}

export function getGenderSegments(_salesData: SalesRecord[]): CustomerSegment[] {
  return [];
}

/**
 * Brand performance from sales. brandId from mark_sales (商品/店舗ブランドコード); brandName from 略称.
 */
export function getBrandPerformance(salesData: SalesRecord[]): BrandPerformance[] {
  const brandMap = new Map<
    string,
    {
      revenue: number;
      transactions: Set<string>;
      customers: Set<string>;
      stores: Set<string>;
      brandName: string;
    }
  >();

  salesData.forEach((sale) => {
    if (sale.totalCost <= 0) return;
    const code = (sale.brandId ?? sale.brandCode)?.trim() || "OTHER";
    if (!brandMap.has(code)) {
      brandMap.set(code, {
        revenue: 0,
        transactions: new Set(),
        customers: new Set(),
        stores: new Set(),
        brandName: (sale.brandName ?? sale.brandCode)?.trim() || code,
      });
    }
    const b = brandMap.get(code)!;
    b.revenue += sale.totalCost;
    b.transactions.add(transactionKey(sale));
    b.customers.add(sale.memberId);
    b.stores.add(sale.storeName?.trim() || "");
  });

  return Array.from(brandMap.entries())
    .map(([brandCode, data]) => ({
      brandCode,
      brandName: data.brandName,
      totalRevenue: data.revenue,
      transactions: data.transactions.size,
      customers: data.customers.size,
      averageOrderValue:
        data.transactions.size > 0 ? data.revenue / data.transactions.size : 0,
      storeCount: data.stores.size,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}
