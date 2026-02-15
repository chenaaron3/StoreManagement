/**
 * Types for precomputed analytics (KPIs, trends, segments).
 * Used by dataAnalysis and precomputedDataLoader.
 */

export interface KPIMetrics {
  totalRevenue: number;
  totalTransactions: number;
  averageOrderValue: number;
  activeCustomers: number;
}

export interface TimeSeriesData {
  date: string;
  revenue: number;
  transactions: number;
  customers: number;
}

export interface ProductTrend {
  date: string;
  [productName: string]: string | number;
}

export interface AttributeTrend {
  date: string;
  [attribute: string]: string | number;
}

export interface CustomerSegment {
  segment: string;
  count: number;
  totalRevenue: number;
  averageRevenue: number;
  percentage: number;
}

export interface DayOfWeekData {
  day: string;
  revenue: number;
  transactions: number;
  customers: number;
}

export interface CustomerDetail {
  memberId: string;
  totalRevenue: number;
  transactionCount: number;
  averageOrderValue: number;
  firstPurchaseDate: string;
  lastPurchaseDate: string;
  daysSinceLastPurchase: number;
  preferredStore: string;
  preferredCategory: string;
  isOnlineCustomer: boolean;
}

export interface ProductPerformance {
  productName: string;
  productCode: string;
  revenue: number;
  quantity: number;
  transactions: number;
  averagePrice: number;
}

export interface StorePerformance {
  storeName: string;
  storeCode: string;
  revenue: number;
  transactions: number;
  customers: number;
  averageOrderValue: number;
}

export interface RFMSegment {
  segment: string;
  description: string;
  count: number;
  totalRevenue: number;
  averageRevenue: number;
  percentage: number;
  rScore: number;
  fScore: number;
  mScore: number;
}

export interface RFMMatrixCell {
  rScore: number;
  fScore: number;
  count: number;
  totalRevenue: number;
  averageRevenue: number;
  averageMScore: number;
  percentage: number;
  segments: RFMSegment[];
  recencyRange?: { min: number; max: number };
  frequencyRange?: { min: number; max: number };
}

export interface PerformanceWithStoreBreakdown {
  name: string;
  totalRevenue: number;
  stores: { storeName: string; revenue: number }[];
}

export interface CollectionTrend {
  date: string;
  [collectionName: string]: string | number;
}

export interface StoreTrend {
  date: string;
  [storeName: string]: string | number;
}

export interface EmployeePerformance {
  staffName: string;
  staffCode: string;
  totalRevenue: number;
  stores: string[];
  products: { productName: string; revenue: number }[];
}

/** Per-brand aggregate for brand comparison. */
export interface BrandPerformance {
  brandCode: string;
  brandName: string;
  totalRevenue: number;
  transactions: number;
  customers: number;
  averageOrderValue: number;
  storeCount: number;
}
