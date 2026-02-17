/**
 * Employee and brand performance.
 */
import type { SalesRecord } from "@/types/data";
import type { EmployeePerformance, BrandPerformance } from "@/types/analysis";
import { transactionKey } from "./dateUtils";

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
