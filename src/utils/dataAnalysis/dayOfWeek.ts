/**
 * Day-of-week sales analysis.
 */
import type { SalesRecord } from "@/types/data";
import type { DayOfWeekData } from "@/types/analysis";
import { transactionKey, parseDateKey } from "./dateUtils";

export function getDayOfWeekAnalysis(
  salesData: SalesRecord[],
): DayOfWeekData[] {
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
      dayMap.set(dayOfWeek, {
        revenue: 0,
        transactions: new Set(),
        customers: new Set(),
      });
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
