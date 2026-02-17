import { useEffect, useMemo, useState } from 'react';

import { loadPrecomputedData } from '@/utils/precomputedDataLoader';

import type { PrecomputedData } from "@/utils/precomputedDataLoader";

export type SearchResultType = "brand" | "store" | "product";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  name: string;
  revenue?: number;
  path: string;
  tab: "brand" | "stores" | "product";
}

export function useSearchResults(query: string, lang: string) {
  const [data, setData] = useState<PrecomputedData | null>(null);

  useEffect(() => {
    loadPrecomputedData().then(setData);
  }, []);

  const results = useMemo((): SearchResult[] => {
    if (!data || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    const out: SearchResult[] = [];

    data.brandPerformance?.slice(0, 50).forEach((b) => {
      const name = b.brandName || b.brandCode;
      if (name.toLowerCase().includes(q)) {
        out.push({
          id: `brand-${b.brandCode}`,
          type: "brand",
          name,
          revenue: b.totalRevenue,
          path: `/${lang}/manager`,
          tab: "brand",
        });
      }
    });

    const stores = (data.storePerformanceWithProducts ?? []) as {
      name: string;
      totalRevenue: number;
    }[];
    stores.slice(0, 50).forEach((s) => {
      if (s.name.toLowerCase().includes(q)) {
        out.push({
          id: `store-${s.name}`,
          type: "store",
          name: s.name,
          revenue: s.totalRevenue,
          path: `/${lang}/manager`,
          tab: "stores",
        });
      }
    });

    const products = (data.productPerformanceWithStores ?? []) as {
      name: string;
      totalRevenue: number;
    }[];
    products.slice(0, 50).forEach((p) => {
      if (p.name.toLowerCase().includes(q)) {
        out.push({
          id: `product-${p.name}`,
          type: "product",
          name: p.name,
          revenue: p.totalRevenue,
          path: `/${lang}/manager`,
          tab: "product",
        });
      }
    });

    return out.slice(0, 12);
  }, [data, query, lang]);

  return results;
}
