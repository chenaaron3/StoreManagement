/**
 * Customer detail aggregation from sales.
 */
import type { SalesRecord } from "@/types/data";
import type { CustomerDetail } from "@/types/analysis";
import { transactionKey } from "./dateUtils";

export function getCustomerDetails(
  salesData: SalesRecord[],
): Map<string, CustomerDetail> {
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

    if (sale.purchaseDate < c.firstPurchaseDate)
      c.firstPurchaseDate = sale.purchaseDate;
    if (sale.purchaseDate > c.lastPurchaseDate)
      c.lastPurchaseDate = sale.purchaseDate;
    if (
      sale.storeName?.toLowerCase().includes("online") ||
      sale.storeName?.includes("オンライン")
    )
      c.isOnlineCustomer = true;
  });

  customerMap.forEach((c) => {
    const cExt = c as CustomerDetail & { _txSet?: Set<string> };
    c.transactionCount = cExt._txSet ? cExt._txSet.size : 0;
    c.averageOrderValue =
      c.transactionCount > 0 ? c.totalRevenue / c.transactionCount : 0;
    const m = c.lastPurchaseDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      const last = new Date(
        parseInt(m[1], 10),
        parseInt(m[2], 10) - 1,
        parseInt(m[3], 10),
      );
      c.daysSinceLastPurchase = Math.floor(
        (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24),
      );
    }
  });

  return customerMap;
}
