/**
 * Extract store-level analytics from precomputed.json for the associate dashboard.
 * Outputs a small store-only JSON to avoid runtime computation.
 *
 * Run: npm run extract-store-data
 * Or after precompute: npm run precompute && npm run extract-store-data
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CURRENT_STORE_NAME = "SAKURA 駅前店";
const CURRENT_STORE_BRAND = "MD";

interface StorePerformanceRow {
  name: string;
  totalRevenue: number;
  stores: { storeName: string; revenue: number }[];
}

interface StoreTrendRow {
  date: string;
  [storeName: string]: string | number;
}

interface EmployeePerformance {
  staffName: string;
  totalRevenue: number;
  stores: string[];
  products?: { productName: string; revenue: number }[];
}

interface PrecomputedData {
  storePerformanceWithProducts?: StorePerformanceRow[];
  storeTrendsWeekly?: StoreTrendRow[];
  storeTrendsMonthly?: StoreTrendRow[];
  employeePerformance?: unknown;
  byBrand?: Record<
    string,
    {
      storePerformanceWithProducts?: StorePerformanceRow[];
      storeTrendsWeekly?: StoreTrendRow[];
      storeTrendsMonthly?: StoreTrendRow[];
    }
  >;
}

interface StoreData {
  storeName: string;
  totalRevenue: number;
  storeTrendDataWeekly: StoreTrendRow[];
  storeTrendDataMonthly: StoreTrendRow[];
  seriesKeys: string[];
  revenueSparkline: { value: number }[];
  topProducts: { rank: number; name: string; value: number }[];
  productRankAtStore: { name: string; revenue: number }[];
  employeesAtStore: { staffName: string; totalRevenue: number; topProducts: string }[];
}

function findStoreRow(data: PrecomputedData): {
  row: StorePerformanceRow;
  source: "root" | string;
} | null {
  const root = data.storePerformanceWithProducts ?? [];
  const found = root.find((r) => r.name === CURRENT_STORE_NAME);
  if (found) return { row: found, source: "root" };

  const byBrand = data.byBrand ?? {};
  for (const [brandCode, brandData] of Object.entries(byBrand)) {
    const perf = brandData?.storePerformanceWithProducts ?? [];
    const row = perf.find((r) => r.name === CURRENT_STORE_NAME);
    if (row) return { row, source: brandCode };
  }
  return null;
}

function getStoreTrends(
  data: PrecomputedData,
  source: "root" | string
): { weekly: StoreTrendRow[]; monthly: StoreTrendRow[] } {
  if (source === "root") {
    return {
      weekly: data.storeTrendsWeekly ?? [],
      monthly: data.storeTrendsMonthly ?? [],
    };
  }
  const brandData = data.byBrand?.[source];
  return {
    weekly: (brandData?.storeTrendsWeekly as StoreTrendRow[]) ?? [],
    monthly: (brandData?.storeTrendsMonthly as StoreTrendRow[]) ?? [],
  };
}

function extractStoreTrendSeries(
  rows: StoreTrendRow[],
  storeName: string
): StoreTrendRow[] {
  if (!rows.length || !(storeName in (rows[0] ?? {}))) return [];
  return rows.map((row) => {
    const val = row[storeName];
    const num = typeof val === "number" ? val : 0;
    return { date: row.date, [storeName]: num };
  });
}

function extract(): StoreData {
  const projectRoot = join(__dirname, "..");
  const precomputedPath = join(projectRoot, "public", "data", "precomputed.json");

  if (!existsSync(precomputedPath)) {
    throw new Error(
      `precomputed.json not found at ${precomputedPath}. Run: npm run precompute`
    );
  }

  const raw = readFileSync(precomputedPath, "utf-8");
  const data = JSON.parse(raw) as PrecomputedData;

  const found = findStoreRow(data);
  if (!found) {
    throw new Error(
      `Store "${CURRENT_STORE_NAME}" not found in precomputed data. Check storePerformanceWithProducts or byBrand.`
    );
  }
  const { row: storeRow, source } = found;

  const { weekly, monthly } = getStoreTrends(data, source);

  const storeTrendDataWeekly = extractStoreTrendSeries(weekly, CURRENT_STORE_NAME);
  const storeTrendDataMonthly = extractStoreTrendSeries(monthly, CURRENT_STORE_NAME);

  const topProducts = (storeRow.stores ?? [])
    .slice(0, 7)
    .map((s, i) => ({
      rank: i + 1,
      name: s.storeName,
      value: s.revenue,
    }));

  const last12 = storeTrendDataMonthly.slice(-12);
  const revenueSparkline = last12.map((row) => ({
    value: (row[CURRENT_STORE_NAME] as number) ?? 0,
  }));

  const empPerf = (data.employeePerformance ?? []) as EmployeePerformance[];
  const employeesAtStore = empPerf
    .filter((e) => (e.stores ?? []).includes(CURRENT_STORE_NAME))
    .map((e) => ({
      staffName: e.staffName,
      totalRevenue: e.totalRevenue ?? 0,
      topProducts: (e.products ?? [])
        .slice(0, 5)
        .map((p) => `${p.productName}: ¥${p.revenue.toLocaleString()}`)
        .join("; "),
    }));

  const productRankAtStore = storeRow.stores ?? [];

  return {
    storeName: CURRENT_STORE_NAME,
    totalRevenue: storeRow.totalRevenue,
    storeTrendDataWeekly,
    storeTrendDataMonthly,
    seriesKeys: [CURRENT_STORE_NAME],
    revenueSparkline,
    topProducts,
    productRankAtStore,
    employeesAtStore,
  };
}

function main() {
  console.log("Extracting store data for", CURRENT_STORE_NAME, "...");
  const storeData = extract();
  const projectRoot = join(__dirname, "..");
  const outputDir = join(projectRoot, "public", "data");
  mkdirSync(outputDir, { recursive: true });
  const outputPath = join(outputDir, "store-sakura.json");
  writeFileSync(outputPath, JSON.stringify(storeData, null, 2), "utf-8");
  console.log("Wrote", outputPath);
}

main();
