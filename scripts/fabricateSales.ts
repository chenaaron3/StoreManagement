/**
 * Fabricate sales by sampling from fabrication_entities.json.
 * Uses real member IDs from memberships.
 * Output: mark_sales_fabricated.csv
 */
import { createWriteStream, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import Papa from "papaparse";

import { parseMarkSalesCSV, parseMarkMembershipsCSV } from "../src/utils/dataParser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function fabricateSales() {
  console.log("Fabricating sales...");

  const projectRoot = join(__dirname, "..");
  const dataDir = join(projectRoot, "src", "data");

  const entitiesPath = join(dataDir, "fabrication_entities.json");
  const salesPath = join(dataDir, "mark_sales.csv");
  const membershipsPath = join(dataDir, "mark_memberships.csv");

  let entities: FabricationEntities;
  try {
    entities = JSON.parse(readFileSync(entitiesPath, "utf-8"));
  } catch (e) {
    throw new Error(
      `Failed to load ${entitiesPath}. Run: npm run build-fabrication-entities`
    );
  }

  const salesCsv = readFileSync(salesPath, "utf-8");
  const membershipsCsv = readFileSync(membershipsPath, "utf-8");

  const salesData = parseMarkSalesCSV(salesCsv);
  const membershipData = parseMarkMembershipsCSV(membershipsCsv);

  const filteredSales = salesData.filter((r) => r.purchaseDate && r.totalCost > 0);

  const salesMd = filteredSales.filter((r) => (r.brandId?.trim() || "") === "00").length;
  const membershipsMd = membershipData.filter(
    (m) => (m.brandCode?.trim() || "") === "00"
  ).length;

  if (membershipsMd === 0) {
    throw new Error("No MD memberships found for ratio calculation");
  }

  const salesPerMembership = salesMd / membershipsMd;

  const colorSizePairs = filteredSales
    .filter((r) => r.color?.trim() && r.size?.trim())
    .map((r) => ({ color: r.color, size: r.size }));
  const fallbackColorSize =
    colorSizePairs.length > 0
      ? () => pick(colorSizePairs)
      : () => ({ color: "BLK", size: "M" });

  // Daily sales breakdown: date -> count. Use this distribution for sampling
  // so weekends (higher volume) are picked more often than weekdays.
  const dailySalesBreakdown = new Map<string, number>();
  for (const r of filteredSales) {
    const raw = (r.purchaseDate ?? "").trim();
    const m = raw.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) {
      const dateKey = m[1];
      dailySalesBreakdown.set(dateKey, (dailySalesBreakdown.get(dateKey) ?? 0) + 1);
    }
  }
  // Flatten to array for proportional sampling: each date appears count times
  const purchaseDatesPool: string[] = [];
  for (const [date, count] of dailySalesBreakdown) {
    for (let i = 0; i < count; i++) purchaseDatesPool.push(date);
  }
  const samplePurchaseDate = () =>
    purchaseDatesPool.length > 0 ? pick(purchaseDatesPool) : "2024-06-15";

  const outputPath = join(dataDir, "mark_sales_fabricated.csv");
  const writeStream = createWriteStream(outputPath, { encoding: "utf-8" });

  const BATCH_SIZE = 50_000;
  let saleIdCounter = 0;

  function writeRows(rows: Record<string, string>[]) {
    if (rows.length === 0) return;
    const csv = Papa.unparse(rows, { columns: CSV_HEADERS, header: false });
    writeStream.write(csv + "\n");
  }

  let headerWritten = false;
  let batch: Record<string, string>[] = [];

  for (const [brandCode, brand] of Object.entries(entities.brands)) {
    const membershipsBrand = membershipData.filter(
      (m) => (m.brandCode?.trim() || "") === brandCode
    ).length;
    const targetCount = Math.round(membershipsBrand * salesPerMembership);

    if (brand.stores.length === 0 || brand.products.length === 0 || brand.memberIds.length === 0) {
      console.warn(`  Brand ${brandCode}: skipping (missing stores/products/members)`);
      continue;
    }

    for (let i = 0; i < targetCount; i++) {
      const store = pick(brand.stores);
      const product = pick(brand.products);
      const salesAssociate = pick(brand.salesAssociates);
      const memberId = pick(brand.memberIds);
      const { color, size } = fallbackColorSize();

      saleIdCounter++;
      const saleId = `FAB${String(saleIdCounter).padStart(15, "0")}`;

      if (!headerWritten) {
        writeStream.write(
          CSV_HEADERS.map((h) => `"${h}"`).join(",") + "\n"
        );
        headerWritten = true;
      }

      batch.push({
        会員ID: memberId,
        購買日: samplePurchaseDate(),
        品番: product.productId,
        商品名: product.productName,
        カラーコード: "001",
        カラー名: color,
        サイズコード: "004",
        サイズ名: size,
        店舗ブランドコード: brandCode,
        店舗ブランド略称: brand.brandName,
        商品ブランドコード: brandCode,
        商品ブランド略称: brand.brandName,
        購買点数: "1",
        税抜金額: String(product.price),
        VS店舗ID: store.vsStoreId,
        店舗名: store.storeName,
        MS店舗ID: store.storeId,
        販売担当者: salesAssociate.name,
        担当者コード: salesAssociate.code,
        売上ID: saleId,
        標準小売単価: String(product.price),
      });

      if (batch.length >= BATCH_SIZE) {
        writeRows(batch);
        batch = [];
      }
    }

    console.log(`  Brand ${brandCode}: ${targetCount} fabricated sales`);
  }

  if (batch.length > 0) {
    writeRows(batch);
  }

  writeStream.end();

  await new Promise<void>((resolve, reject) => {
    writeStream.on("finish", () => {
      console.log(`Wrote ${outputPath} (${saleIdCounter} rows)`);
      resolve();
    });
    writeStream.on("error", reject);
  });
  console.log("Fabricate sales complete.");
}

fabricateSales().catch((err) => {
  console.error("Error fabricating sales:", err);
  process.exit(1);
});
