import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import * as dataAnalysis from '../src/utils/dataAnalysis';
import { parseMarkSalesCSV, parseMarkTransactionsCSV } from '../src/utils/dataParser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function precomputeData() {
  console.log("Starting data precomputation...");

  const projectRoot = join(__dirname, "..");
  const dataDir = join(projectRoot, "src", "data");
  const publicDataDir = join(projectRoot, "public", "data");

  const salesPath = join(dataDir, "mark_sales.csv");
  const transactionsPath = join(dataDir, "mark_transactions.csv");

  console.log("Reading CSV files...");
  const salesCsv = readFileSync(salesPath, "utf-8");
  const transactionsCsv = readFileSync(transactionsPath, "utf-8");

  console.log("Parsing CSV files...");
  const salesData = parseMarkSalesCSV(salesCsv);
  const membershipData = parseMarkTransactionsCSV(transactionsCsv);

  const filteredSales = salesData.filter((r) => {
    if (!r.purchaseDate || r.totalCost <= 0) return false;
    return true;
  });

  console.log(
    `Processed ${filteredSales.length} sales records and ${membershipData.length} membership records`,
  );

  const precomputed = {
    kpis: dataAnalysis.calculateKPIs(filteredSales),
    trendDataDaily: dataAnalysis.getTrendsByGranularity(filteredSales, "daily"),
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
    brandPerformance: dataAnalysis.getBrandPerformance(filteredSales),
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

try {
  precomputeData();
} catch (err) {
  console.error("Error during precomputation:", err);
  process.exit(1);
}
