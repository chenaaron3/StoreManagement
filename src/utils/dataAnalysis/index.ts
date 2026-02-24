/**
 * Analytics functions for sales_analytics (clothing, multi-brand).
 * Re-exports from domain modules for backward compatibility.
 */
export type { Granularity } from "@/types/analysis";
export { getDateKey } from "./dateUtils";
export { calculateKPIs, getTrendsByGranularity } from "./kpi";
export { getCustomerDetails } from "./customerDetails";
export { getCustomerList, getCustomerPurchases } from "./customerList";
export type { CustomerDemographics } from "./customerList";
export {
  getCustomerSegments,
  getFrequencySegments,
  getChannelSegments,
  getAOVSegments,
} from "./customerSegments";
export { getRFMSegments, getRFMMatrix } from "./rfm";
export {
  getTopProducts,
  getProductTrends,
  getProductPerformanceWithStores,
  getCategoryPerformanceWithStores,
  getCollectionPerformanceWithStores,
  getColorPerformanceWithStores,
  getSizePerformanceWithStores,
  getAttributeTrends,
  getCollectionTrends,
  getCategoryTrends,
} from "./productPerformance";
export {
  getStorePerformance,
  getStorePerformanceWithProducts,
  getStoreTrends,
} from "./storePerformance";
export { getDayOfWeekAnalysis } from "./dayOfWeek";
export { getEmployeePerformance, getEmployeePerformanceWithRanks, getBrandPerformance } from "./employeeBrand";
export type { MemberDemographics } from "./demographics";
export { getAgeSegments, getGenderSegments } from "./demographics";
