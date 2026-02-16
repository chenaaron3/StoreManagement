/**
 * Build fabrication_entities.json from memberships and MD sales.
 * Entities: stores, products (with prices), salesAssociates, memberIds per brand.
 * Only builds for brands that have memberships but no (or few) sales.
 */
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import Papa from "papaparse";

import { parseMarkSalesCSV, parseMarkMembershipsCSV } from "../src/utils/dataParser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Brand code to display name (fallback when membership store names lack brand). */
const BRAND_CODE_TO_NAME: Record<string, string> = {
  "00": "MD",
  "01": "EMODA",
  "02": "MURUA",
  "03": "RESEXXY",
  "04": "EVRIS",
  "07": "EATME",
  "08": "CALNAMUR",
  "11": "Ungrid",
  "12": "OUTLET",
  "15": "GYDA",
  "28": "merry jenny",
  "34": "jouetie",
  "37": "dazzlin",
  "51": "MERCURYDUO",
  "52": "MERCURYDUO",
  "53": "MERCURYDUO",
  "59": "MERCURYDUO",
  "65": "MERCURYDUO",
};

/** Replace スタッフ1/2/3 with random Japanese names */
const RANDOM_STAFF_NAMES = [
  "田中 美咲", "佐藤 健太", "鈴木 彩花", "高橋 翔太", "伊藤 優子",
  "渡辺 大輔", "山本 恵子", "中村 拓也", "小林 真由美", "加藤 翔",
  "吉田 麻衣", "山田 涼太", "松本 美穂", "井上 和也", "木村 由香",
];

/** Brand-specific product names (research-backed). */
const BRAND_PRODUCT_NAMES: Record<string, string[]> = {
  "01": [
    "2Wayコルセットスカート",
    "フロントタックスカート",
    "セーラーカラークロップドニット",
    "ミリタリージャケット",
    "異素材ドッキングニットワンピース",
    "ドレープロングスリーブニット",
  ],
  "02": [
    "アシンメトリーリボンストライプワンピース",
    "レースフレアスカート",
    "ラッフルカーディガン",
    "ギャザースリーブワンピース",
  ],
  "03": [
    "ウエストサッシュワイドパンツ",
    "マキシワンピース",
    "ニットドレス",
    "ジャンプスーツ",
    "パーティーワンピース",
  ],
  "04": [
    "フレアスカート",
    "ロングコート",
    "ニットワンピース",
    "セットアップニット",
    "ミリタリージャケット",
  ],
  "07": ["ワイドパンツ", "ニットワンピース", "フレアスカート", "カーディガン"],
  "08": [
    "ボレロニット",
    "ライダージャケット",
    "フレアスカート",
    "ワイドパンツ",
    "ニットカーディガン",
  ],
  "11": ["ワイドパンツ", "デニムパンツ", "ジャケット", "ミニスカート"],
  "12": [], // OUTLET: fallback to MD pool
  "15": ["トップス", "ワンピース", "パンツ", "ジャケット"],
  "28": ["ニットワンピース", "スカート", "トップス"],
  "34": ["ワンピース", "パンツ", "ジャケット"],
  "37": ["ドレス", "ジャケット", "パンツ", "スカート"],
  "51": ["ニットワンピース", "フレアスカート", "カーディガン"],
  "52": ["ワイドパンツ", "ニット", "ワンピース"],
  "53": ["ワンピース", "スカート", "ニット"],
  "59": ["ニットワンピース", "フレアパンツ", "ジャケット"],
  "65": ["トップス", "パンツ", "ジャケット"],
};

interface RawMembershipRow {
  会員ID: string;
  ブランドCD: string;
  店舗CD: string;
  店舗ID: string;
  店舗名: string;
  担当者コード: string;
  担当者名: string;
}

interface FabricationStore {
  storeCode: string;
  storeId: string;
  storeName: string;
  vsStoreId: string;
}

interface FabricationProduct {
  productId: string;
  productName: string;
  price: number;
}

interface FabricationSalesAssociate {
  name: string;
  code: string;
}

interface FabricationBrand {
  brandName: string;
  stores: FabricationStore[];
  products: FabricationProduct[];
  salesAssociates: FabricationSalesAssociate[];
  memberIds: string[];
}

interface FabricationEntities {
  brands: Record<string, FabricationBrand>;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildFabricationEntities() {
  console.log("Building fabrication entities...");

  const projectRoot = join(__dirname, "..");
  const dataDir = join(projectRoot, "src", "data");

  const salesPath = join(dataDir, "mark_sales.csv");
  const membershipsPath = join(dataDir, "mark_memberships.csv");

  const salesCsv = readFileSync(salesPath, "utf-8");
  const membershipsCsv = readFileSync(membershipsPath, "utf-8");

  const salesData = parseMarkSalesCSV(salesCsv);
  const membershipData = parseMarkMembershipsCSV(membershipsCsv);

  // Parse memberships raw for storeId and associate code
  const membResults = Papa.parse<RawMembershipRow>(membershipsCsv, {
    header: true,
    skipEmptyLines: true,
  });
  const rawMemberships = (membResults.data ?? []).filter(
    (r) => r?.["会員ID"]?.trim()
  );

  // Brands that have sales
  const salesBrandCodes = new Set(
    salesData.filter((r) => r.totalCost > 0).map((r) => r.brandId?.trim()).filter(Boolean)
  );

  // MD sales for price distribution and product fallback
  const mdSales = salesData.filter(
    (r) => (r.brandId?.trim() || "") === "00" && r.totalCost > 0
  );
  const mdPrices = mdSales.map((r) => r.totalCost);
  const mdProductNames = [...new Set(mdSales.map((r) => r.productName).filter(Boolean))];

  if (mdPrices.length === 0) {
    throw new Error("No MD (brand 00) sales found for price sampling");
  }

  // Group raw memberships by brandCode
  const membershipsByBrand = new Map<string, RawMembershipRow[]>();
  for (const row of rawMemberships) {
    const code = (row["ブランドCD"] ?? "").trim();
    if (!code) continue;
    if (!membershipsByBrand.has(code)) {
      membershipsByBrand.set(code, []);
    }
    membershipsByBrand.get(code)!.push(row);
  }

  const entities: FabricationEntities = { brands: {} };

  for (const [brandCode, rows] of membershipsByBrand) {
    // Only build for brands without sales (or optionally with few)
    if (salesBrandCodes.has(brandCode)) continue;

    const storeKeys = new Set<string>();
    const stores: FabricationStore[] = [];
    const associateKeys = new Set<string>();
    const salesAssociates: FabricationSalesAssociate[] = [];
    const memberIdSet = new Set<string>();

    for (const r of rows) {
      const storeCode = (r["店舗CD"] ?? "").trim();
      const storeId = (r["店舗ID"] ?? "").trim();
      const storeName = (r["店舗名"] ?? "").trim();
      if (storeCode || storeName) {
        const key = `${storeCode}|${storeId}|${storeName}`;
        if (!storeKeys.has(key)) {
          storeKeys.add(key);
          // Ensure "Brand Location" format: if store name has no space, prepend brand
          const brandDisplay = BRAND_CODE_TO_NAME[brandCode] ?? brandCode;
          const normalizedStoreName =
            storeName && !storeName.includes(" ")
              ? `${brandDisplay} ${storeName}`
              : storeName || brandDisplay;
          stores.push({
            storeCode: storeCode || storeId,
            storeId: storeId || storeCode,
            storeName: normalizedStoreName,
            vsStoreId: storeId || storeCode,
          });
        }
      }

      const assocCode = (r["担当者コード"] ?? "").trim();
      let assocName = (r["担当者名"] ?? "").trim();
      // Replace placeholder names like スタッフ1, スタッフ2 with random names
      if (/^スタッフ\d+$/.test(assocName)) {
        assocName = pick(RANDOM_STAFF_NAMES);
      }
      if (assocName) {
        const key = `${assocCode}|${assocName}`;
        if (!associateKeys.has(key)) {
          associateKeys.add(key);
          salesAssociates.push({
            name: assocName,
            code: assocCode || assocName,
          });
        }
      }

      const mid = (r["会員ID"] ?? "").trim();
      if (mid) memberIdSet.add(mid);
    }

    const brandName =
      rows[0]?.["店舗名"]?.trim().split(/\s+/)[0] || brandCode;

    const productNames = BRAND_PRODUCT_NAMES[brandCode] ?? [];
    const namesToUse =
      productNames.length > 0 ? productNames : mdProductNames;
    if (namesToUse.length === 0) {
      console.warn(`No product names for brand ${brandCode}, skipping products`);
    }

    const products: FabricationProduct[] = namesToUse.map((name, i) => ({
      productId: `FAB${brandCode}${String(i + 1).padStart(5, "0")}`,
      productName: name,
      price: pick(mdPrices),
    }));

    entities.brands[brandCode] = {
      brandName,
      stores: stores.length > 0 ? stores : [{ storeCode: brandCode, storeId: brandCode, storeName: brandName, vsStoreId: brandCode }],
      products: products.length > 0 ? products : [{ productId: `FAB${brandCode}00001`, productName: "商品", price: pick(mdPrices) }],
      salesAssociates:
        salesAssociates.length > 0
          ? salesAssociates
          : [{ name: "担当者", code: "000000" }],
      memberIds: Array.from(memberIdSet),
    };

    console.log(
      `  Brand ${brandCode}: ${stores.length} stores, ${products.length} products, ${salesAssociates.length} associates, ${memberIdSet.size} members`
    );
  }

  mkdirSync(dataDir, { recursive: true });
  const outputPath = join(dataDir, "fabrication_entities.json");
  writeFileSync(outputPath, JSON.stringify(entities, null, 2), "utf-8");

  console.log("Wrote", outputPath);
  console.log("Build fabrication entities complete.");
}

try {
  buildFabricationEntities();
} catch (err) {
  console.error("Error building fabrication entities:", err);
  process.exit(1);
}
