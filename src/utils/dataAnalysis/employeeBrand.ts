/**
 * Employee and brand performance.
 */
import type { SalesRecord } from "@/types/data";
import type { EmployeePerformance, BrandPerformance } from "@/types/analysis";
import { assignRanksByLtvPercentile } from "@/config/internalRank";
import { transactionKey } from "./dateUtils";

/** Get most recent month start (YYYY-MM-DD) from sales for monthly metrics. */
function getLatestMonthStart(sales: SalesRecord[]): string {
  let latest = "2000-01-01";
  sales.forEach((s) => {
    if (s.purchaseDate && s.purchaseDate > latest) latest = s.purchaseDate;
  });
  const d = new Date(latest);
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
}

export function getEmployeePerformance(
  salesData: SalesRecord[],
  _topN?: number,
): EmployeePerformance[] {
  const employeeMap = new Map<
    string,
    { totalRevenue: number; products: Map<string, number>; stores: Set<string> }
  >();

  salesData.forEach((sale) => {
    if (sale.totalCost <= 0 || !sale.salesAssociate?.trim()) return;
    const key = sale.salesAssociate.trim();
    if (!employeeMap.has(key)) {
      employeeMap.set(key, {
        totalRevenue: 0,
        products: new Map(),
        stores: new Set(),
      });
    }
    const e = employeeMap.get(key)!;
    e.totalRevenue += sale.totalCost;
    e.stores.add(sale.storeName?.trim() || "");
    const name =
      sale.productName ?? sale.itemName ?? sale.productId ?? sale.itemId ?? "";
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

/** Extended employee performance with S/A/B rank counts and monthly metrics. */
export function getEmployeePerformanceWithRanks(
  salesData: SalesRecord[]
): EmployeePerformance[] {
  const base = getEmployeePerformance(salesData);
  const monthStart = getLatestMonthStart(salesData);

  const totalRevenueByMember = new Map<string, number>();
  const memberToAssociates = new Map<string, Set<string>>();

  salesData.forEach((sale) => {
    if (sale.totalCost <= 0 || !sale.salesAssociate?.trim()) return;
    totalRevenueByMember.set(
      sale.memberId,
      (totalRevenueByMember.get(sale.memberId) || 0) + sale.totalCost
    );
    if (sale.purchaseDate >= monthStart) {
      if (!memberToAssociates.has(sale.memberId)) {
        memberToAssociates.set(sale.memberId, new Set());
      }
      memberToAssociates.get(sale.memberId)!.add(sale.salesAssociate.trim());
    }
  });

  const rankByMember = assignRanksByLtvPercentile(totalRevenueByMember);

  const associateToCustomers = new Map<
    string,
    Map<"S" | "A" | "B" | "C", number>
  >();

  memberToAssociates.forEach((assocs, memberId) => {
    const rank = rankByMember.get(memberId) ?? "C";
    assocs.forEach((a) => {
      if (!associateToCustomers.has(a)) {
        associateToCustomers.set(a, new Map([["S", 0], ["A", 0], ["B", 0], ["C", 0]]));
      }
      associateToCustomers.get(a)!.set(rank, (associateToCustomers.get(a)!.get(rank) || 0) + 1);
    });
  });

  const monthlyByAssociate = new Map<string, { revenue: number; items: number; customers: Set<string> }>();
  salesData.forEach((sale) => {
    if (sale.totalCost <= 0 || !sale.salesAssociate?.trim()) return;
    if (sale.purchaseDate < monthStart) return;
    const key = sale.salesAssociate.trim();
    if (!monthlyByAssociate.has(key)) {
      monthlyByAssociate.set(key, { revenue: 0, items: 0, customers: new Set() });
    }
    const e = monthlyByAssociate.get(key)!;
    e.revenue += sale.totalCost;
    e.items += sale.quantity || 1;
    e.customers.add(sale.memberId);
  });

  return base.map((emp) => {
    const rankCounts = associateToCustomers.get(emp.staffName);
    const monthly = monthlyByAssociate.get(emp.staffName);
    return {
      ...emp,
      monthlyRevenue: monthly?.revenue ?? 0,
      monthlyItems: monthly?.items ?? 0,
      customerCount: monthly?.customers.size ?? 0,
      rankS: rankCounts?.get("S") ?? 0,
      rankA: rankCounts?.get("A") ?? 0,
      rankB: rankCounts?.get("B") ?? 0,
    };
  });
}

export function getBrandPerformance(
  salesData: SalesRecord[],
): BrandPerformance[] {
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
