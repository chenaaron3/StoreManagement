/**
 * Helpers for filtering precomputed data by brand/store.
 */

type PerformanceWithStores = {
  name: string;
  totalRevenue: number;
  stores: { storeName: string; revenue: number }[];
};

export function createStoreMatchesBrand(storePrefix: string) {
  return (storeName: string) =>
    !storePrefix || (storeName?.trim() || "").startsWith(storePrefix);
}

export function filterPerformanceWithStores(
  items: PerformanceWithStores[],
  storeMatchesBrand: (storeName: string) => boolean
): PerformanceWithStores[] {
  return items
    .map((item) => {
      const matchingStores = (item.stores ?? []).filter((s) =>
        storeMatchesBrand(s.storeName)
      );
      const totalRevenue = matchingStores.reduce((sum, s) => sum + s.revenue, 0);
      return { ...item, stores: matchingStores, totalRevenue };
    })
    .filter((item) => item.totalRevenue > 0 || item.stores.length > 0)
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}
