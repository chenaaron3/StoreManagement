/**
 * Build fabrication_entities.json from memberships and MD sales.
 * Entities: stores, products (with prices), salesAssociates, memberIds per brand.
 * Only builds for brands that have memberships but no (or few) sales.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import Papa from 'papaparse';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { parseMarkMembershipsCSV, parseMarkSalesCSV } from '../src/utils/dataParser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Brand code to display name (fallback when membership store names lack brand). */
const BRAND_CODE_TO_NAME: Record<string, string> = {
  // "00": "SAKURA",
  "01": "KAEDE",
  "02": "WAKABA",
  "03": "SAKURA",
  // "04": "EVRIS",
  // "07": "EATME",
  // "08": "CALNAMUR",
  // "11": "Ungrid",
  // "12": "OUTLET",
  // "15": "GYDA",
  // "28": "merry jenny",
  // "34": "jouetie",
  // "37": "dazzlin",
  // "51": "MERCURYDUO",
  // "52": "MERCURYDUO",
  // "53": "MERCURYDUO",
  // "59": "MERCURYDUO",
  // "65": "MERCURYDUO",
};

/** Replace スタッフ1/2/3 with random Japanese names */
const RANDOM_STAFF_NAMES = [
  "田中 美咲",
  "佐藤 健太",
  "鈴木 彩花",
  "高橋 翔太",
  "伊藤 優子",
  "渡辺 大輔",
  "山本 恵子",
  "中村 拓也",
  "小林 真由美",
  "加藤 翔",
  "吉田 麻衣",
  "山田 涼太",
  "松本 美穂",
  "井上 和也",
  "木村 由香",
  // New random names, not present in CSV
  "森下 美羽",
  "大島 祐樹",
  "岡本 莉沙",
  "浅野 晴貴",
  "岸本 千聖",
  "三浦 奏太",
  "永田 麗奈",
  "福島 大智",
  "内田 理沙",
  "藤森 竜也",
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

/** Shuffle array (Fisher–Yates) and return new array. */
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
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
  const rawMemberships = (membResults.data ?? []).filter((r) =>
    r?.["会員ID"]?.trim(),
  );

  // Brands that have sales
  const salesBrandCodes = new Set(
    salesData
      .filter((r) => r.totalCost > 0)
      .map((r) => r.brandId?.trim())
      .filter(Boolean),
  );

  // MD sales for price distribution and product fallback
  const mdSales = salesData.filter(
    (r) => (r.brandId?.trim() || "") === "00" && r.totalCost > 0,
  );
  const mdPrices = mdSales.map((r) => r.totalCost);
  const mdProductNames = [
    ...new Set(mdSales.map((r) => r.productName).filter(Boolean)),
  ];

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
    // Only build for brands we've enabled in BRAND_CODE_TO_NAME (e.g. 3 stores)
    if (!(brandCode in BRAND_CODE_TO_NAME)) continue;
    // Only build for brands without sales (or optionally with few)
    if (salesBrandCodes.has(brandCode)) continue;

    // Use memberships only for counts (ratios); no real names or IDs in output
    const storeKeys = new Set<string>();
    const associateKeys = new Set<string>();
    const memberIdSet = new Set<string>();
    for (const r of rows) {
      const storeCode = (r["店舗CD"] ?? "").trim();
      const storeId = (r["店舗ID"] ?? "").trim();
      const storeName = (r["店舗名"] ?? "").trim();
      if (storeCode || storeId || storeName) {
        storeKeys.add(`${storeCode}|${storeId}|${storeName}`);
      }
      const assocCode = (r["担当者コード"] ?? "").trim();
      const assocName = (r["担当者名"] ?? "").trim();
      if (assocCode || assocName) {
        associateKeys.add(`${assocCode}|${assocName}`);
      }
      const mid = (r["会員ID"] ?? "").trim();
      if (mid) memberIdSet.add(mid);
    }

    const storeCount = Math.max(1, storeKeys.size);
    const associateCount = Math.max(1, associateKeys.size);
    const memberCount = memberIdSet.size;

    const brandDisplay = BRAND_CODE_TO_NAME[brandCode] ?? brandCode;

    // Fabricated stores: no real names/codes from CSV
    const stores: FabricationStore[] = Array.from({ length: storeCount }, (_, i) => {
      const idx = String(i + 1);
      const code = `FAB${brandCode}S${idx.padStart(3, "0")}`;
      return {
        storeCode: code,
        storeId: code,
        storeName: `${brandDisplay} 店舗${i + 1}`,
        vsStoreId: code,
      };
    });

    // Fabricated associates: names from pool, no real codes
    const staffPool = shuffle(RANDOM_STAFF_NAMES);
    const salesAssociates: FabricationSalesAssociate[] = Array.from(
      { length: associateCount },
      (_, i) => {
        const name =
          i < staffPool.length
            ? staffPool[i]
            : `担当者 ${i + 1}`;
        const code = `FAB${brandCode}A${String(i + 1).padStart(4, "0")}`;
        return { name, code };
      },
    );

    // Fabricated member IDs: same count, no real IDs
    const memberIds = Array.from({ length: memberCount }, (_, i) =>
      `FAB${brandCode}M${String(i + 1).padStart(8, "0")}`,
    );

    const productNames = BRAND_PRODUCT_NAMES[brandCode] ?? [];
    const namesToUse = productNames.length > 0 ? productNames : mdProductNames;
    if (namesToUse.length === 0) {
      console.warn(
        `No product names for brand ${brandCode}, skipping products`,
      );
    }

    const products: FabricationProduct[] = namesToUse.map((name, i) => ({
      productId: `FAB${brandCode}P${String(i + 1).padStart(5, "0")}`,
      productName: name,
      price: pick(mdPrices),
    }));

    entities.brands[brandCode] = {
      brandName: brandDisplay,
      stores,
      products:
        products.length > 0
          ? products
          : [
              {
                productId: `FAB${brandCode}P00001`,
                productName: "商品",
                price: pick(mdPrices),
              },
            ],
      salesAssociates,
      memberIds,
    };

    console.log(
      `  Brand ${brandCode}: ${storeCount} stores, ${products.length} products, ${associateCount} associates, ${memberCount} members`,
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
