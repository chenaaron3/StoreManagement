import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import * as dataAnalysis from '../src/utils/dataAnalysis';
import {
  parseMarkSalesCSV,
  parseMarkSalesCSVStream,
  parseMarkMembershipsCSV,
} from '../src/utils/dataParser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function precomputeData() {
  console.log("Starting data precomputation...");

  const projectRoot = join(__dirname, "..");
  const dataDir = join(projectRoot, "src", "data");
  const publicDataDir = join(projectRoot, "public", "data");

  const salesPath = join(dataDir, "mark_sales.csv");
  const fabricatedPath = join(dataDir, "mark_sales_fabricated.csv");
  const membershipsPath = join(dataDir, "mark_memberships.csv");

  console.log("Reading CSV files...");
  const salesCsv = readFileSync(salesPath, "utf-8");
  const membershipsCsv = readFileSync(membershipsPath, "utf-8");

  let fabricatedData: Awaited<ReturnType<typeof parseMarkSalesCSVStream>> = [];
  try {
    if (existsSync(fabricatedPath)) {
      console.log("Found mark_sales_fabricated.csv, streaming parse...");
      fabricatedData = await parseMarkSalesCSVStream(fabricatedPath);
      console.log(`Parsed ${fabricatedData.length} fabricated sales.`);
    } else {
      console.log("No mark_sales_fabricated.csv, using sales only.");
    }
  } catch (e) {
    console.log("Could not load mark_sales_fabricated.csv:", (e as Error).message);
  }

  console.log("Parsing CSV files...");
  const salesData = parseMarkSalesCSV(salesCsv);
  const mergedSales = [...salesData, ...fabricatedData];
  const membershipData = parseMarkMembershipsCSV(membershipsCsv);

  const filteredSales = mergedSales.filter((r) => {
    if (!r.purchaseDate || r.totalCost <= 0) return false;
    return true;
  });

  console.log(
    `Processed ${filteredSales.length} sales records (${salesData.length} real, ${fabricatedData.length} fabricated) and ${membershipData.length} membership records`,
  );

  // Brand performance: include all brands from memberships, with sales metrics when present
  const brandFromSales = dataAnalysis.getBrandPerformance(filteredSales);
  const salesByBrandCode = new Map(
    brandFromSales.map((b) => [b.brandCode, b]),
  );
  const brandNameFromMembership = new Map<string, string>();
  const membershipBrandCodes = new Set<string>();
  for (const m of membershipData) {
    membershipBrandCodes.add(m.brandCode);
    if (!brandNameFromMembership.has(m.brandCode) && m.storeName?.trim()) {
      const firstWord = m.storeName.trim().split(/\s+/)[0] || m.brandCode;
      brandNameFromMembership.set(m.brandCode, firstWord);
    }
  }
  const allBrandCodes = new Set([
    ...salesByBrandCode.keys(),
    ...membershipBrandCodes,
  ]);
  const brandPerformance = Array.from(allBrandCodes)
    .map((brandCode) => {
      const fromSales = salesByBrandCode.get(brandCode);
      const brandName =
        fromSales?.brandName ||
        brandNameFromMembership.get(brandCode) ||
        brandCode;
      return {
        brandCode,
        brandName,
        totalRevenue: fromSales?.totalRevenue ?? 0,
        transactions: fromSales?.transactions ?? 0,
        customers: fromSales?.customers ?? 0,
        averageOrderValue: fromSales?.averageOrderValue ?? 0,
        storeCount: fromSales?.storeCount ?? 0,
      };
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  const precomputed = {
    kpis: dataAnalysis.calculateKPIs(filteredSales),
    trendDataWeekly: dataAnalysis.getTrendsByGranularity(
      filteredSales,
      "weekly",
    ),
    trendDataMonthly: dataAnalysis.getTrendsByGranularity(
      filteredSales,
      "monthly",
    ),
    dayOfWeekData: dataAnalysis.getDayOfWeekAnalysis(filteredSales),
    colorTrends: dataAnalysis.getAttributeTrends(
      filteredSales,
      "color",
      "monthly",
    ),
    sizeTrends: dataAnalysis.getAttributeTrends(
      filteredSales,
      "size",
      "monthly",
    ),
    customerSegments: dataAnalysis.getCustomerSegments(filteredSales),
    productTrendsWeekly: dataAnalysis.getProductTrends(
      filteredSales,
      25,
      "weekly",
    ),
    productTrendsMonthly: dataAnalysis.getProductTrends(
      filteredSales,
      25,
      "monthly",
    ),
    collectionTrendsWeekly: dataAnalysis.getCollectionTrends(
      filteredSales,
      25,
      "weekly",
    ),
    collectionTrendsMonthly: dataAnalysis.getCollectionTrends(
      filteredSales,
      25,
      "monthly",
    ),
    categoryTrendsWeekly: dataAnalysis.getCategoryTrends(
      filteredSales,
      25,
      "weekly",
    ),
    categoryTrendsMonthly: dataAnalysis.getCategoryTrends(
      filteredSales,
      25,
      "monthly",
    ),
    productPerformanceWithStores: dataAnalysis.getProductPerformanceWithStores(
      filteredSales,
      25,
    ),
    collectionPerformanceWithStores:
      dataAnalysis.getCollectionPerformanceWithStores(filteredSales, 25),
    categoryPerformanceWithStores:
      dataAnalysis.getCategoryPerformanceWithStores(filteredSales, 25),
    colorPerformanceWithStores: dataAnalysis.getColorPerformanceWithStores(
      filteredSales,
      25,
    ),
    sizePerformanceWithStores: dataAnalysis.getSizePerformanceWithStores(
      filteredSales,
      25,
    ),
    storePerformanceWithProducts: dataAnalysis.getStorePerformanceWithProducts(
      filteredSales,
      25,
    ),
    storeTrendsWeekly: dataAnalysis.getStoreTrends(filteredSales, 25, "weekly"),
    storeTrendsMonthly: dataAnalysis.getStoreTrends(
      filteredSales,
      25,
      "monthly",
    ),
    rfmMatrix: dataAnalysis.getRFMMatrix(filteredSales),
    frequencySegments: dataAnalysis.getFrequencySegments(filteredSales),
    ageSegments: dataAnalysis.getAgeSegments(filteredSales),
    genderSegments: dataAnalysis.getGenderSegments(filteredSales),
    channelSegments: dataAnalysis.getChannelSegments(filteredSales),
    aovSegments: dataAnalysis.getAOVSegments(filteredSales),
    employeePerformance: dataAnalysis.getEmployeePerformance(filteredSales),
    brandPerformance,
  };

  mkdirSync(publicDataDir, { recursive: true });
  const outputPath = join(publicDataDir, "precomputed.json");
  console.log("Writing precomputed data to", outputPath);
  writeFileSync(outputPath, JSON.stringify(precomputed, null, 2), "utf-8");

  console.log("Data precomputation complete.");
  console.log(
    `Precomputed ${Object.keys(precomputed).length} analysis results.`,
  );
}

precomputeData().catch((err) => {
  console.error("Error during precomputation:", err);
  process.exit(1);
});
