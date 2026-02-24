import { spawn } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import * as dataAnalysis from "../src/utils/dataAnalysis";
import { assignRanksByLtvPercentile } from "../src/config/internalRank";
import { parseMarkSalesCSVStream } from '../src/utils/dataParser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Max customers in customerList/customerPurchases. Default 1000 for lighter output.
 * Set PRECOMPUTE_CUSTOMER_LIMIT=0 for unlimited (full dataset). */
const DEFAULT_CUSTOMER_LIMIT = 1000;

function getCustomerLimit(): number {
  const env = process.env.PRECOMPUTE_CUSTOMER_LIMIT;
  if (env == null || env === "") return DEFAULT_CUSTOMER_LIMIT;
  const n = parseInt(env, 10);
  return Number.isNaN(n) || n < 0 ? DEFAULT_CUSTOMER_LIMIT : n;
}

/** Use compact JSON (faster) unless PRECOMPUTE_PRETTY=1 */
function usePrettyPrint(): boolean {
  return process.env.PRECOMPUTE_PRETTY === "1";
}

async function precomputeData() {
  const limit = getCustomerLimit();
  console.log(
    `Starting data precomputation... (customer limit: ${limit === 0 ? "unlimited" : limit})`
  );

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

  // Pre-group sales by brand in a single pass (avoids repeated filter() per brand)
  type SalesRecord = (typeof filteredSales)[number];
  const salesGroupedByBrandCode = new Map<string, SalesRecord[]>();
  const salesByStorePrefix = new Map<string, SalesRecord[]>();
  for (const r of filteredSales) {
    const code = (r.brandId?.trim() || r.brandCode?.trim() || "") || "_none";
    if (!salesGroupedByBrandCode.has(code)) salesGroupedByBrandCode.set(code, []);
    salesGroupedByBrandCode.get(code)!.push(r);

    const sn = (r.storeName || "").trim();
    const spaceIdx = sn.indexOf(" ");
    if (spaceIdx > 0) {
      const prefix = sn.slice(0, spaceIdx + 1);
      if (!salesByStorePrefix.has(prefix)) salesByStorePrefix.set(prefix, []);
      salesByStorePrefix.get(prefix)!.push(r);
    }
  }
  console.log(
    `Pre-grouped sales by ${salesGroupedByBrandCode.size} brand codes, ${salesByStorePrefix.size} store prefixes.`,
  );

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

  const workerPath = join(__dirname, "workers", "brandAnalyticsWorker.ts");
  const runBrandWorker = (brand: (typeof brandPerformance)[0]) =>
    new Promise<{ brandCode: string; result: (typeof byBrand)[string] }>(
      (resolve, reject) => {
        const salesForBrand =
          salesGroupedByBrandCode.get(brand.brandCode || "_none") ?? [];
        const storeNamePrefix = brand.brandName ? brand.brandName + " " : "";
        const byStore = storeNamePrefix
          ? (salesByStorePrefix.get(storeNamePrefix) ?? [])
          : [];
        const combined = new Set<SalesRecord>([...salesForBrand, ...byStore]);
        const salesForBrandStores = Array.from(combined);
        const salesToUse =
          salesForBrandStores.length > 0 ? salesForBrandStores : salesForBrand;

        const input = JSON.stringify({
          brandCode: brand.brandCode,
          salesToUse,
          memberDemographics,
        });
        const proc = spawn("npx", ["tsx", workerPath], {
          stdio: ["pipe", "pipe", "pipe"],
          cwd: join(__dirname, ".."),
        });
        let stdout = "";
        proc.stdout?.on("data", (chunk: Buffer) => {
          stdout += chunk.toString();
        });
        proc.stderr?.on("data", (chunk: Buffer) => {
          process.stderr.write(chunk);
        });
        proc.on("error", reject);
        proc.on("close", (code) => {
          if (code !== 0) {
            reject(new Error(`Worker exited with code ${code}`));
            return;
          }
          try {
            resolve(JSON.parse(stdout) as { brandCode: string; result: (typeof byBrand)[string] });
          } catch (e) {
            reject(e);
          }
        });
        proc.stdin?.write(input, "utf-8", () => proc.stdin?.end());
      },
    );

  console.log(
    `  Running per-brand analytics in parallel (${brandPerformance.length} workers)...`,
  );
  const brandResults = await Promise.all(
    brandPerformance.map((brand, i) => {
      console.log(
        `  byBrand ${brand.brandCode} (${i + 1}/${brandPerformance.length})...`,
      );
      return runBrandWorker(brand);
    }),
  );
  for (const { brandCode, result } of brandResults) {
    byBrand[brandCode] = result;
  }

  console.log("Building global analytics...");
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
    employeePerformance: dataAnalysis.getEmployeePerformanceWithRanks(filteredSales),
    brandPerformance,
    byBrand,
    ...((): { customerList: ReturnType<typeof dataAnalysis.getCustomerList>; customerPurchases: Record<string, unknown[]> } => {
      const limit = getCustomerLimit();
      console.log("Building customerList...");
      const fullList = dataAnalysis.getCustomerList(filteredSales, memberDemographics);
      let list =
        limit > 0
          ? [...fullList].sort((a, b) => (b.totalRevenue ?? 0) - (a.totalRevenue ?? 0)).slice(0, limit)
          : fullList;
      // Re-assign ranks within the limited set so displayed customers have S/A/B/C distribution
      if (limit > 0 && list.length > 0) {
        const revenueMap = new Map(list.map((c) => [c.memberId, c.totalRevenue ?? 0]));
        const rankByMember = assignRanksByLtvPercentile(revenueMap);
        list = list.map((c) => ({ ...c, internalRank: rankByMember.get(c.memberId) ?? "C" }));
      }
      console.log(`  customerList: ${list.length} customers${limit > 0 ? ` (limited from ${fullList.length})` : ""}`);

      console.log("Building customerPurchases...");
      const fullPurchases = dataAnalysis.getCustomerPurchases(filteredSales);
      let purchases: Record<string, unknown[]>;
      if (limit > 0) {
        const topIds = new Set(list.map((c) => c.memberId));
        purchases = {};
        for (const [mid, arr] of Object.entries(fullPurchases)) {
          if (topIds.has(mid)) purchases[mid] = arr;
        }
        console.log(`  customerPurchases: ${Object.keys(purchases).length} members (limited from ${Object.keys(fullPurchases).length})`);
      } else {
        purchases = fullPurchases;
        console.log(`  customerPurchases: ${Object.keys(purchases).length} members`);
      }
      return { customerList: list, customerPurchases: purchases };
    })(),
  };

  mkdirSync(publicDataDir, { recursive: true });
  const outputPath = join(publicDataDir, "precomputed.json");
  console.log("Writing precomputed data to", outputPath);
  const json = usePrettyPrint()
    ? JSON.stringify(precomputed, null, 2)
    : JSON.stringify(precomputed);
  writeFileSync(outputPath, json, "utf-8");

  console.log("Data precomputation complete.");
  console.log(
    `Precomputed ${Object.keys(precomputed).length} analysis results.`,
  );
}

precomputeData().catch((err) => {
  console.error("Error during precomputation:", err);
  process.exit(1);
});
