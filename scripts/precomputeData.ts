import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import * as dataAnalysis from '../src/utils/dataAnalysis';
import { parseMarkSalesCSVStream } from '../src/utils/dataParser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function precomputeData() {
  console.log("Starting data precomputation...");

  const projectRoot = join(__dirname, "..");
  const dataDir = join(projectRoot, "src", "data");
  const publicDataDir = join(projectRoot, "public", "data");

  const anonymizedPath = join(dataDir, "mark_sales_anonymized.csv");

  if (!existsSync(anonymizedPath)) {
    throw new Error(
      "mark_sales_anonymized.csv not found. Run: npm run anonymize-sales",
    );
  }

  console.log("Reading anonymized sales...");
  const anonymizedData = await parseMarkSalesCSVStream(anonymizedPath);
  console.log(`Parsed ${anonymizedData.length} anonymized sales.`);

  const filteredSales = anonymizedData.filter((r) => {
    if (!r.purchaseDate || r.totalCost <= 0) return false;
    return true;
  });

  console.log(`Processed ${filteredSales.length} sales records.`);

  const demographicsPath = join(publicDataDir, "member_demographics.json");
  let memberDemographics: dataAnalysis.MemberDemographics | null = null;
  if (existsSync(demographicsPath)) {
    memberDemographics = JSON.parse(
      readFileSync(demographicsPath, "utf-8"),
    ) as dataAnalysis.MemberDemographics;
    console.log(
      `Loaded member demographics: ${Object.keys(memberDemographics).length} members`,
    );
  } else {
    console.log(
      "No member_demographics.json; age/gender segments will use fallback. Run: npm run build-member-demographics",
    );
  }

  // Brand performance: from anonymized sales only (no memberships)
  const brandFromSales = dataAnalysis.getBrandPerformance(filteredSales);
  const salesByBrandCode = new Map(brandFromSales.map((b) => [b.brandCode, b]));
  const allBrandCodes = new Set(salesByBrandCode.keys());
  const brandPerformance = Array.from(allBrandCodes)
    .map((brandCode) => {
      const fromSales = salesByBrandCode.get(brandCode);
      const brandName = fromSales?.brandName ?? brandCode;
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

  // Per-brand analytics for brand filter
  const byBrand: Record<
    string,
    {
      kpis: ReturnType<typeof dataAnalysis.calculateKPIs>;
      trendDataWeekly: ReturnType<typeof dataAnalysis.getTrendsByGranularity>;
      trendDataMonthly: ReturnType<typeof dataAnalysis.getTrendsByGranularity>;
      dayOfWeekData: ReturnType<typeof dataAnalysis.getDayOfWeekAnalysis>;
      customerSegments: ReturnType<typeof dataAnalysis.getCustomerSegments>;
      rfmMatrix: ReturnType<typeof dataAnalysis.getRFMMatrix>;
      frequencySegments: ReturnType<typeof dataAnalysis.getFrequencySegments>;
      ageSegments: ReturnType<typeof dataAnalysis.getAgeSegments>;
      genderSegments: ReturnType<typeof dataAnalysis.getGenderSegments>;
      channelSegments: ReturnType<typeof dataAnalysis.getChannelSegments>;
      aovSegments: ReturnType<typeof dataAnalysis.getAOVSegments>;
      employeePerformance: ReturnType<
        typeof dataAnalysis.getEmployeePerformance
      >;
      storePerformanceWithProducts: ReturnType<
        typeof dataAnalysis.getStorePerformanceWithProducts
      >;
      storeTrendsWeekly: ReturnType<typeof dataAnalysis.getStoreTrends>;
      storeTrendsMonthly: ReturnType<typeof dataAnalysis.getStoreTrends>;
      productPerformanceWithStores: ReturnType<
        typeof dataAnalysis.getProductPerformanceWithStores
      >;
      productTrendsWeekly: ReturnType<typeof dataAnalysis.getProductTrends>;
      productTrendsMonthly: ReturnType<typeof dataAnalysis.getProductTrends>;
      collectionPerformanceWithStores: ReturnType<
        typeof dataAnalysis.getCollectionPerformanceWithStores
      >;
      collectionTrendsWeekly: ReturnType<
        typeof dataAnalysis.getCollectionTrends
      >;
      collectionTrendsMonthly: ReturnType<
        typeof dataAnalysis.getCollectionTrends
      >;
      categoryPerformanceWithStores: ReturnType<
        typeof dataAnalysis.getCategoryPerformanceWithStores
      >;
      categoryTrendsWeekly: ReturnType<typeof dataAnalysis.getCategoryTrends>;
      categoryTrendsMonthly: ReturnType<typeof dataAnalysis.getCategoryTrends>;
      colorPerformanceWithStores: ReturnType<
        typeof dataAnalysis.getColorPerformanceWithStores
      >;
      sizePerformanceWithStores: ReturnType<
        typeof dataAnalysis.getSizePerformanceWithStores
      >;
      colorTrends: ReturnType<typeof dataAnalysis.getAttributeTrends>;
      sizeTrends: ReturnType<typeof dataAnalysis.getAttributeTrends>;
    }
  > = {};

  for (const brand of brandPerformance) {
    const salesForBrand = filteredSales.filter(
      (r) =>
        (r.brandId?.trim() || r.brandCode?.trim() || "") === brand.brandCode,
    );
    const storeNamePrefix = brand.brandName ? brand.brandName + " " : "";
    const salesForBrandStores = filteredSales.filter(
      (r) =>
        (r.storeName?.trim() || "").startsWith(storeNamePrefix) ||
        (r.brandId?.trim() || r.brandCode?.trim() || "") === brand.brandCode,
    );
    const salesToUse =
      salesForBrandStores.length > 0 ? salesForBrandStores : salesForBrand;

    byBrand[brand.brandCode] = {
      kpis: dataAnalysis.calculateKPIs(salesToUse),
      trendDataWeekly: dataAnalysis.getTrendsByGranularity(
        salesToUse,
        "weekly",
      ),
      trendDataMonthly: dataAnalysis.getTrendsByGranularity(
        salesToUse,
        "monthly",
      ),
      dayOfWeekData: dataAnalysis.getDayOfWeekAnalysis(salesToUse),
      customerSegments: dataAnalysis.getCustomerSegments(salesToUse),
      rfmMatrix: dataAnalysis.getRFMMatrix(salesToUse),
      frequencySegments: dataAnalysis.getFrequencySegments(salesToUse),
      ageSegments: dataAnalysis.getAgeSegments(salesToUse, memberDemographics),
      genderSegments: dataAnalysis.getGenderSegments(
        salesToUse,
        memberDemographics,
      ),
      channelSegments: dataAnalysis.getChannelSegments(salesToUse),
      aovSegments: dataAnalysis.getAOVSegments(salesToUse),
      employeePerformance: dataAnalysis.getEmployeePerformance(salesToUse),
      storePerformanceWithProducts:
        dataAnalysis.getStorePerformanceWithProducts(salesToUse, 25),
      storeTrendsWeekly: dataAnalysis.getStoreTrends(salesToUse, 25, "weekly"),
      storeTrendsMonthly: dataAnalysis.getStoreTrends(
        salesToUse,
        25,
        "monthly",
      ),
      productPerformanceWithStores:
        dataAnalysis.getProductPerformanceWithStores(salesToUse, 25),
      productTrendsWeekly: dataAnalysis.getProductTrends(
        salesToUse,
        25,
        "weekly",
      ),
      productTrendsMonthly: dataAnalysis.getProductTrends(
        salesToUse,
        25,
        "monthly",
      ),
      collectionPerformanceWithStores:
        dataAnalysis.getCollectionPerformanceWithStores(salesToUse, 25),
      collectionTrendsWeekly: dataAnalysis.getCollectionTrends(
        salesToUse,
        25,
        "weekly",
      ),
      collectionTrendsMonthly: dataAnalysis.getCollectionTrends(
        salesToUse,
        25,
        "monthly",
      ),
      categoryPerformanceWithStores:
        dataAnalysis.getCategoryPerformanceWithStores(salesToUse, 25),
      categoryTrendsWeekly: dataAnalysis.getCategoryTrends(
        salesToUse,
        25,
        "weekly",
      ),
      categoryTrendsMonthly: dataAnalysis.getCategoryTrends(
        salesToUse,
        25,
        "monthly",
      ),
      colorPerformanceWithStores: dataAnalysis.getColorPerformanceWithStores(
        salesToUse,
        25,
      ),
      sizePerformanceWithStores: dataAnalysis.getSizePerformanceWithStores(
        salesToUse,
        25,
      ),
      colorTrends: dataAnalysis.getAttributeTrends(
        salesToUse,
        "color",
        "monthly",
      ),
      sizeTrends: dataAnalysis.getAttributeTrends(
        salesToUse,
        "size",
        "monthly",
      ),
    };
  }

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
    ageSegments: dataAnalysis.getAgeSegments(filteredSales, memberDemographics),
    genderSegments: dataAnalysis.getGenderSegments(
      filteredSales,
      memberDemographics,
    ),
    channelSegments: dataAnalysis.getChannelSegments(filteredSales),
    aovSegments: dataAnalysis.getAOVSegments(filteredSales),
    employeePerformance: dataAnalysis.getEmployeePerformance(filteredSales),
    brandPerformance,
    byBrand,
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
