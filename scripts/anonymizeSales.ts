/**
 * Anonymize the three brand sales CSVs into a single mark_sales_anonymized.csv.
 * Run: npm run anonymize-sales
 * Then: npm run precompute
 */

import { createReadStream, createWriteStream, existsSync, mkdirSync, writeFileSync } from 'fs';
import Papa from 'papaparse';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import {
    ANONYMIZED_ONLINE_STORE_NAME, BRAND_MAP, FAMILY_NAMES, GIVEN_NAMES,
    MEMBER_ID_REPLACEMENT_PREFIXES, ONLINE_STORE_KEYWORDS, PHYSICAL_STORE_NAME_POOL,
    PRODUCT_CATEGORY_KEYWORDS, PRODUCT_FALLBACK_CATEGORY
} from './anonymizeMappings';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CSV_HEADERS = [
  "会員ID",
  "購買日",
  "品番",
  "商品名",
  "カラーコード",
  "カラー名",
  "サイズコード",
  "サイズ名",
  "店舗ブランドコード",
  "店舗ブランド略称",
  "商品ブランドコード",
  "商品ブランド略称",
  "購買点数",
  "税抜金額",
  "VS店舗ID",
  "店舗名",
  "MS店舗ID",
  "販売担当者",
  "担当者コード",
  "売上ID",
  "標準小売単価",
];

const BRAND_CSVS = [
  join(__dirname, "..", "src", "data", "mark_sales_md.csv"),
  join(__dirname, "..", "src", "data", "mark_sales_EL.csv"),
  join(__dirname, "..", "src", "data", "mark_sales_LM.csv"),
];

function isOnlineStore(storeName: string): boolean {
  const s = storeName?.trim() || "";
  const upper = s.toUpperCase();
  return ONLINE_STORE_KEYWORDS.some(
    (kw) => upper.includes(kw.toUpperCase()) || s.includes(kw),
  );
}

function escapeCsvField(value: string): string {
  const v = String(value ?? "");
  if (
    v.includes('"') ||
    v.includes(",") ||
    v.includes("\n") ||
    v.includes("\r")
  ) {
    return '"' + v.replace(/"/g, '""') + '"';
  }
  return v;
}

function generalizeProductName(productName: string): string {
  const name = (productName ?? "").trim();
  if (!name) return PRODUCT_FALLBACK_CATEGORY;
  for (const { pattern, category } of PRODUCT_CATEGORY_KEYWORDS) {
    if (typeof pattern === "string") {
      if (name.includes(pattern)) return category;
    } else if (pattern.test(name)) return category;
  }
  return PRODUCT_FALLBACK_CATEGORY;
}

function getBrandMapping(
  codeOrName: string,
): { code: string; name: string } | null {
  const key = (codeOrName ?? "").trim();
  return BRAND_MAP[key] ?? null;
}

async function collectDistinctValues(): Promise<{
  memberPrefixes: Set<string>;
  storeNames: Set<string>;
  associateNames: Set<string>;
}> {
  const memberPrefixes = new Set<string>();
  const storeNames = new Set<string>();
  const associateNames = new Set<string>();

  for (const filePath of BRAND_CSVS) {
    if (!existsSync(filePath)) {
      console.warn(`Skip (not found): ${filePath}`);
      continue;
    }
    await new Promise<void>((resolve, reject) => {
      const stream = createReadStream(filePath, { encoding: "utf-8" });
      Papa.parse(stream, {
        header: true,
        skipEmptyLines: true,
        step: (results) => {
          const row = results.data as Record<string, string>;
          if (!row || typeof row !== "object") return;
          const mid = row["会員ID"]?.trim() ?? "";
          if (mid.length >= 2) memberPrefixes.add(mid.slice(0, 2));
          const store = row["店舗名"]?.trim() ?? "";
          if (store) storeNames.add(store);
          const assoc = row["販売担当者"]?.trim() ?? "";
          if (assoc) associateNames.add(assoc);
        },
        complete: () => resolve(),
        error: (err) => reject(err),
      });
    });
  }

  return { memberPrefixes, storeNames, associateNames };
}

function buildMappings(
  memberPrefixes: Set<string>,
  storeNames: Set<string>,
  associateNames: Set<string>,
): {
  memberPrefixMap: Map<string, string>;
  storeMap: Map<string, string>;
  associateMap: Map<string, string>;
} {
  const sortedPrefixes = Array.from(memberPrefixes).sort();
  const memberPrefixMap = new Map<string, string>();
  sortedPrefixes.forEach((p, i) => {
    memberPrefixMap.set(p, MEMBER_ID_REPLACEMENT_PREFIXES[i] ?? `X${i}`);
  });

  const storeMap = new Map<string, string>();
  const physicalStores: string[] = [];
  const onlineStores: string[] = [];
  storeNames.forEach((name) => {
    if (isOnlineStore(name)) onlineStores.push(name);
    else physicalStores.push(name);
  });
  onlineStores.forEach((name) =>
    storeMap.set(name, ANONYMIZED_ONLINE_STORE_NAME),
  );
  physicalStores.sort();
  physicalStores.forEach((name, i) => {
    storeMap.set(
      name,
      PHYSICAL_STORE_NAME_POOL[i % PHYSICAL_STORE_NAME_POOL.length],
    );
  });

  const sortedAssociates = Array.from(associateNames).sort();
  const associateMap = new Map<string, string>();
  sortedAssociates.forEach((name, i) => {
    const fam = FAMILY_NAMES[i % FAMILY_NAMES.length];
    const given =
      GIVEN_NAMES[Math.floor(i / FAMILY_NAMES.length) % GIVEN_NAMES.length];
    associateMap.set(name, `${fam} ${given}`);
  });

  return { memberPrefixMap, storeMap, associateMap };
}

function anonymizeRow(
  row: Record<string, string>,
  memberPrefixMap: Map<string, string>,
  storeMap: Map<string, string>,
  associateMap: Map<string, string>,
): Record<string, string> {
  const out = { ...row };

  const memberId = (row["会員ID"] ?? "").trim();
  if (memberId.length >= 2) {
    const prefix = memberPrefixMap.get(memberId.slice(0, 2));
    if (prefix) out["会員ID"] = prefix + memberId.slice(2);
  }

  const storeBrandCode = (row["店舗ブランドコード"] ?? "").trim();
  const storeBrandName = (row["店舗ブランド略称"] ?? "").trim();
  const productBrandCode = (row["商品ブランドコード"] ?? "").trim();
  const productBrandName = (row["商品ブランド略称"] ?? "").trim();
  const brandByCode =
    getBrandMapping(storeBrandCode) ?? getBrandMapping(storeBrandName);
  const brandByName =
    getBrandMapping(storeBrandName) ?? getBrandMapping(productBrandName);
  const brand = brandByCode ?? brandByName;
  if (brand) {
    out["店舗ブランドコード"] = brand.code;
    out["店舗ブランド略称"] = brand.name;
    out["商品ブランドコード"] = brand.code;
    out["商品ブランド略称"] = brand.name;
  }

  const storeName = (row["店舗名"] ?? "").trim();
  if (storeName && storeMap.has(storeName)) {
    out["店舗名"] = storeMap.get(storeName)!;
  }

  const associate = (row["販売担当者"] ?? "").trim();
  if (associate && associateMap.has(associate)) {
    out["販売担当者"] = associateMap.get(associate)!;
  }

  const productName = (row["商品名"] ?? "").trim();
  if (productName) {
    out["商品名"] = generalizeProductName(productName);
  }

  return out;
}

function writeCsvRow(
  stream: NodeJS.WritableStream,
  row: Record<string, string>,
): void {
  const line =
    CSV_HEADERS.map((h) => escapeCsvField(row[h] ?? "")).join(",") + "\n";
  stream.write(line);
}

async function run() {
  console.log("Anonymizing sales data (3 brand CSVs)...");

  const projectRoot = join(__dirname, "..");
  const dataDir = join(projectRoot, "src", "data");
  const outputPath = join(dataDir, "mark_sales_anonymized.csv");

  const missing = BRAND_CSVS.filter((p) => !existsSync(p));
  if (missing.length > 0) {
    throw new Error(
      `Missing input files. Run from project root. Missing: ${missing.join(", ")}`,
    );
  }

  console.log(
    "Pass 1: collecting distinct member prefixes, store names, associate names...",
  );
  const { memberPrefixes, storeNames, associateNames } =
    await collectDistinctValues();
  console.log(
    `  Member ID prefixes: ${memberPrefixes.size} (${[...memberPrefixes].sort().join(", ")})`,
  );
  console.log(`  Store names: ${storeNames.size}`);
  console.log(`  Associate names: ${associateNames.size}`);

  const { memberPrefixMap, storeMap, associateMap } = buildMappings(
    memberPrefixes,
    storeNames,
    associateNames,
  );

  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

  const publicDataDir = join(projectRoot, "public", "data");
  if (!existsSync(publicDataDir)) mkdirSync(publicDataDir, { recursive: true });
  const prefixMapPath = join(publicDataDir, "member_prefix_map.json");
  const prefixMapObj = Object.fromEntries(memberPrefixMap);
  writeFileSync(prefixMapPath, JSON.stringify(prefixMapObj, null, 2), "utf-8");
  console.log("Wrote member ID prefix map to", prefixMapPath);

  console.log("Pass 2: writing anonymized CSV...");
  const outStream = createWriteStream(outputPath, { encoding: "utf-8" });
  writeCsvRow(
    outStream,
    Object.fromEntries(CSV_HEADERS.map((h) => [h, h])) as Record<
      string,
      string
    >,
  );
  let totalRows = 0;

  for (const filePath of BRAND_CSVS) {
    await new Promise<void>((resolve, reject) => {
      const stream = createReadStream(filePath, { encoding: "utf-8" });
      Papa.parse(stream, {
        header: true,
        skipEmptyLines: true,
        step: (results) => {
          const row = results.data as Record<string, string>;
          if (!row || typeof row !== "object") return;
          const anonymized = anonymizeRow(
            row,
            memberPrefixMap,
            storeMap,
            associateMap,
          );
          writeCsvRow(outStream, anonymized);
          totalRows++;
        },
        complete: () => resolve(),
        error: (err) => reject(err),
      });
    });
  }

  outStream.end();
  await new Promise((res) => outStream.on("finish", res));

  console.log(`Wrote ${totalRows} rows to ${outputPath}`);
  console.log("Done. Run: npm run precompute");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
