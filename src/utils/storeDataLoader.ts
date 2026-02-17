/**
 * Load store-only analytics JSON for the associate dashboard.
 */

export interface StoreData {
  storeName: string;
  totalRevenue: number;
  storeTrendDataWeekly: { date: string; [key: string]: string | number }[];
  storeTrendDataMonthly: { date: string; [key: string]: string | number }[];
  seriesKeys: string[];
  revenueSparkline: { value: number }[];
  topProducts: { rank: number; name: string; value: number }[];
  productRankAtStore: { name: string; revenue: number }[];
  employeesAtStore: { staffName: string; totalRevenue: number; topProducts: string }[];
}

let cachedData: StoreData | null = null;

export async function loadStoreData(): Promise<StoreData | null> {
  if (cachedData) return cachedData;

  const baseUrl = import.meta.env.BASE_URL ?? "/";
  const url = `${baseUrl}data/store-sakura.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = (await response.json()) as StoreData;
    if (!data.storeName || !data.topProducts) return null;
    cachedData = data;
    return data;
  } catch {
    return null;
  }
}
