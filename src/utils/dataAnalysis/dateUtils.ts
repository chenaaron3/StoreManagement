/**
 * Date and transaction key utilities for analytics.
 */
import type { SalesRecord } from "@/types/data";
import type { Granularity } from "@/types/analysis";

/** Derive transaction key for KPIs (no transactionNumber in CSV). */
export function transactionKey(r: SalesRecord): string {
  return `${r.purchaseDate}|${r.memberId}|${r.storeName}`;
}

export function parseDateKey(dateStr: string): Date | null {
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return new Date(
    parseInt(m[1], 10),
    parseInt(m[2], 10) - 1,
    parseInt(m[3], 10),
  );
}

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
        (date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24),
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
