/**
 * Customer segment calculations (lifetime value, frequency, channel, AOV).
 */
import type { SalesRecord } from "@/types/data";
import type { CustomerSegment } from "@/types/analysis";
import { getCustomerDetails } from "./customerDetails";

export function getCustomerSegments(
  salesData: SalesRecord[],
): CustomerSegment[] {
  const customerMap = new Map<string, number>();
  salesData.forEach((sale) => {
    if (sale.totalCost <= 0) return;
    customerMap.set(
      sale.memberId,
      (customerMap.get(sale.memberId) || 0) + sale.totalCost,
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

export function getFrequencySegments(
  salesData: SalesRecord[],
): CustomerSegment[] {
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

export function getChannelSegments(
  salesData: SalesRecord[],
): CustomerSegment[] {
  const storeMap = new Map<string, number>();
  salesData.forEach((sale) => {
    if (sale.totalCost <= 0) return;
    const channel = sale.storeName?.trim() || "Other";
    storeMap.set(channel, (storeMap.get(channel) || 0) + sale.totalCost);
  });
  const total = salesData.reduce(
    (sum, s) => sum + (s.totalCost > 0 ? 1 : 0),
    0,
  );
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
  const buckets: CustomerSegment[] = [
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
