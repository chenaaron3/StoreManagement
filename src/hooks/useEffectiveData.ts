/**
 * Hook to compute brand-filtered precomputed data for Manager view.
 */
import { useMemo } from "react";
import type { PrecomputedData } from "@/utils/precomputedDataLoader";
import {
  createStoreMatchesBrand,
  filterPerformanceWithStores,
} from "@/utils/brandFilter";

type PerfWithStores = {
  name: string;
  totalRevenue: number;
  stores: { storeName: string; revenue: number }[];
};

export function useEffectiveData(
  data: PrecomputedData | null,
  brandFilter: string
): PrecomputedData | null {
  return useMemo((): PrecomputedData | null => {
    if (!data) return null;
    if (brandFilter === "all") return data;

    const selectedBrand = data.brandPerformance?.find(
      (b) => b.brandCode === brandFilter
    );
    const brandName = selectedBrand?.brandName ?? "";
    const storePrefix = brandName ? `${brandName} ` : "";
    const storeMatchesBrand = createStoreMatchesBrand(storePrefix);

    if (data.byBrand?.[brandFilter]) {
      const brandData = data.byBrand[brandFilter] as Record<string, unknown>;
      return {
        ...data,
        kpis: brandData.kpis as PrecomputedData["kpis"],
        trendDataWeekly: brandData.trendDataWeekly as PrecomputedData["trendDataWeekly"],
        trendDataMonthly: brandData.trendDataMonthly as PrecomputedData["trendDataMonthly"],
        dayOfWeekData: brandData.dayOfWeekData as PrecomputedData["dayOfWeekData"],
        customerSegments: brandData.customerSegments as PrecomputedData["customerSegments"],
        rfmMatrix: brandData.rfmMatrix as PrecomputedData["rfmMatrix"],
        frequencySegments: brandData.frequencySegments as PrecomputedData["frequencySegments"],
        ageSegments: (brandData.ageSegments ?? data.ageSegments) as PrecomputedData["ageSegments"],
        genderSegments: (brandData.genderSegments ?? data.genderSegments) as PrecomputedData["genderSegments"],
        channelSegments: brandData.channelSegments as PrecomputedData["channelSegments"],
        aovSegments: brandData.aovSegments as PrecomputedData["aovSegments"],
        employeePerformance: brandData.employeePerformance as PrecomputedData["employeePerformance"],
        storePerformanceWithProducts: brandData.storePerformanceWithProducts as PrecomputedData["storePerformanceWithProducts"],
        storeTrendsWeekly: brandData.storeTrendsWeekly as PrecomputedData["storeTrendsWeekly"],
        storeTrendsMonthly: brandData.storeTrendsMonthly as PrecomputedData["storeTrendsMonthly"],
        productPerformanceWithStores: (brandData.productPerformanceWithStores ?? data.productPerformanceWithStores) as PrecomputedData["productPerformanceWithStores"],
        productTrendsWeekly: (brandData.productTrendsWeekly ?? data.productTrendsWeekly) as PrecomputedData["productTrendsWeekly"],
        productTrendsMonthly: (brandData.productTrendsMonthly ?? data.productTrendsMonthly) as PrecomputedData["productTrendsMonthly"],
        collectionPerformanceWithStores: (brandData.collectionPerformanceWithStores ?? data.collectionPerformanceWithStores) as PrecomputedData["collectionPerformanceWithStores"],
        collectionTrendsWeekly: (brandData.collectionTrendsWeekly ?? data.collectionTrendsWeekly) as PrecomputedData["collectionTrendsWeekly"],
        collectionTrendsMonthly: (brandData.collectionTrendsMonthly ?? data.collectionTrendsMonthly) as PrecomputedData["collectionTrendsMonthly"],
        categoryPerformanceWithStores: (brandData.categoryPerformanceWithStores ?? data.categoryPerformanceWithStores) as PrecomputedData["categoryPerformanceWithStores"],
        categoryTrendsWeekly: (brandData.categoryTrendsWeekly ?? data.categoryTrendsWeekly) as PrecomputedData["categoryTrendsWeekly"],
        categoryTrendsMonthly: (brandData.categoryTrendsMonthly ?? data.categoryTrendsMonthly) as PrecomputedData["categoryTrendsMonthly"],
        colorPerformanceWithStores: (brandData.colorPerformanceWithStores ?? data.colorPerformanceWithStores) as PrecomputedData["colorPerformanceWithStores"],
        sizePerformanceWithStores: (brandData.sizePerformanceWithStores ?? data.sizePerformanceWithStores) as PrecomputedData["sizePerformanceWithStores"],
        colorTrends: (brandData.colorTrends ?? data.colorTrends) as PrecomputedData["colorTrends"],
        sizeTrends: (brandData.sizeTrends ?? data.sizeTrends) as PrecomputedData["sizeTrends"],
      };
    }

    if (!selectedBrand) return data;

    const empPerf = (data.employeePerformance ?? []) as { staffName: string; stores: string[] }[];
    const filteredEmployees = empPerf.filter((e) =>
      (e.stores ?? []).some((s) => storeMatchesBrand(s))
    );

    const storePerf = (data.storePerformanceWithProducts ?? []) as {
      name: string;
      totalRevenue: number;
      stores: { storeName: string; revenue: number }[];
    }[];
    const filteredStores = storePerf
      .filter((s) => storeMatchesBrand(s.name))
      .map((s) => {
        const matchingStores = (s.stores ?? []).filter((ps) =>
          storeMatchesBrand(ps.storeName)
        );
        return { ...s, stores: matchingStores, totalRevenue: s.totalRevenue };
      });

    const storeTrendsW = (data.storeTrendsWeekly ?? []) as { date: string; [k: string]: string | number }[];
    const storeTrendsM = (data.storeTrendsMonthly ?? []) as { date: string; [k: string]: string | number }[];
    const derivedTrendWeekly = storeTrendsW.map((row) => {
      const keys = Object.keys(row).filter((k) => k !== "date");
      const matchingKeys = keys.filter((k) => storeMatchesBrand(k));
      const revenue = matchingKeys.reduce(
        (sum, k) => sum + (typeof row[k] === "number" ? (row[k] as number) : 0),
        0
      );
      return { date: row.date, revenue, transactions: revenue, customers: revenue };
    });
    const derivedTrendMonthly = storeTrendsM.map((row) => {
      const keys = Object.keys(row).filter((k) => k !== "date");
      const matchingKeys = keys.filter((k) => storeMatchesBrand(k));
      const revenue = matchingKeys.reduce(
        (sum, k) => sum + (typeof row[k] === "number" ? (row[k] as number) : 0),
        0
      );
      return { date: row.date, revenue, transactions: revenue, customers: revenue };
    });

    return {
      ...data,
      kpis: {
        totalRevenue: selectedBrand.totalRevenue ?? 0,
        totalTransactions: selectedBrand.transactions ?? 0,
        averageOrderValue: selectedBrand.averageOrderValue ?? 0,
        activeCustomers: selectedBrand.customers ?? 0,
      },
      trendDataWeekly: derivedTrendWeekly,
      trendDataMonthly: derivedTrendMonthly,
      dayOfWeekData: data.dayOfWeekData,
      storePerformanceWithProducts: filteredStores,
      storeTrendsWeekly: storeTrendsW.map((row) => {
        const out: { date: string; [k: string]: string | number } = { date: row.date };
        Object.keys(row)
          .filter((k) => k !== "date" && storeMatchesBrand(k))
          .forEach((k) => (out[k] = row[k] as number));
        return out;
      }) as PrecomputedData["storeTrendsWeekly"],
      storeTrendsMonthly: storeTrendsM.map((row) => {
        const out: { date: string; [k: string]: string | number } = { date: row.date };
        Object.keys(row)
          .filter((k) => k !== "date" && storeMatchesBrand(k))
          .forEach((k) => (out[k] = row[k] as number));
        return out;
      }) as PrecomputedData["storeTrendsMonthly"],
      employeePerformance: filteredEmployees,
      productPerformanceWithStores: filterPerformanceWithStores(
        (data.productPerformanceWithStores ?? []) as PerfWithStores[],
        storeMatchesBrand
      ),
      collectionPerformanceWithStores: filterPerformanceWithStores(
        (data.collectionPerformanceWithStores ?? []) as PerfWithStores[],
        storeMatchesBrand
      ),
      categoryPerformanceWithStores: filterPerformanceWithStores(
        (data.categoryPerformanceWithStores ?? []) as PerfWithStores[],
        storeMatchesBrand
      ),
      colorPerformanceWithStores: filterPerformanceWithStores(
        (data.colorPerformanceWithStores ?? []) as PerfWithStores[],
        storeMatchesBrand
      ),
      sizePerformanceWithStores: filterPerformanceWithStores(
        (data.sizePerformanceWithStores ?? []) as PerfWithStores[],
        storeMatchesBrand
      ),
      productTrendsWeekly: data.productTrendsWeekly,
      productTrendsMonthly: data.productTrendsMonthly,
      collectionTrendsWeekly: data.collectionTrendsWeekly,
      collectionTrendsMonthly: data.collectionTrendsMonthly,
      categoryTrendsWeekly: data.categoryTrendsWeekly,
      categoryTrendsMonthly: data.categoryTrendsMonthly,
      customerSegments: data.customerSegments,
      rfmMatrix: data.rfmMatrix,
      frequencySegments: data.frequencySegments,
      channelSegments: (
        (data.channelSegments ?? []) as { segment: string; count: number; totalRevenue: number; averageRevenue: number; percentage: number }[]
      ).filter((c) => storeMatchesBrand(c.segment)),
      aovSegments: data.aovSegments,
    };
  }, [data, brandFilter]);
}
