/**
 * Standalone script: compute per-brand analytics. Reads JSON from stdin,
 * writes result JSON to stdout. Used for parallel execution via spawn.
 */
import { createInterface } from "readline";
import * as dataAnalysis from "../../src/utils/dataAnalysis";

type SalesRecord = Parameters<typeof dataAnalysis.calculateKPIs>[0][number];
type MemberDemographics = dataAnalysis.MemberDemographics | null;

interface Input {
  brandCode: string;
  salesToUse: SalesRecord[];
  memberDemographics: MemberDemographics;
}

async function main() {
  const lines: string[] = [];
  const rl = createInterface({ input: process.stdin });
  for await (const line of rl) lines.push(line);
  const input: Input = JSON.parse(lines.join("\n"));

  const { brandCode, salesToUse, memberDemographics } = input;
  const result = {
    kpis: dataAnalysis.calculateKPIs(salesToUse),
    trendDataWeekly: dataAnalysis.getTrendsByGranularity(salesToUse, "weekly"),
    trendDataMonthly: dataAnalysis.getTrendsByGranularity(salesToUse, "monthly"),
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
    employeePerformance: dataAnalysis.getEmployeePerformanceWithRanks(
      salesToUse,
    ),
    storePerformanceWithProducts:
      dataAnalysis.getStorePerformanceWithProducts(salesToUse, 25),
    storeTrendsWeekly: dataAnalysis.getStoreTrends(salesToUse, 25, "weekly"),
    storeTrendsMonthly: dataAnalysis.getStoreTrends(salesToUse, 25, "monthly"),
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
    colorPerformanceWithStores:
      dataAnalysis.getColorPerformanceWithStores(salesToUse, 25),
    sizePerformanceWithStores:
      dataAnalysis.getSizePerformanceWithStores(salesToUse, 25),
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

  process.stdout.write(JSON.stringify({ brandCode, result }));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
