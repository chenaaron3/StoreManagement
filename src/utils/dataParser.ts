import { createReadStream } from "fs";
import Papa from "papaparse";
import type { SalesRecord } from "@/types/data";
import type { MembershipRecord } from "@/types/data";

function rowToSalesRecord(row: Record<string, string>): SalesRecord | null {
  const memberId = row["会員ID"]?.trim() ?? "";
  const purchaseDate = row["購買日"]?.trim() ?? "";
  if (!memberId || !purchaseDate) return null;

  const quantity = parseFloat(row["購買点数"] ?? "0") || 1;
  const totalCost = parseFloat(row["税抜金額"] ?? "0") || 0;
  const brandId =
    row["商品ブランドコード"]?.trim() || row["店舗ブランドコード"]?.trim() || "";
  const brandName =
    row["商品ブランド略称"]?.trim() || row["店舗ブランド略称"]?.trim() || "";

  return {
    memberId,
    purchaseDate,
    brandId,
    brandName,
    productId: row["品番"]?.trim() ?? "",
    productName: row["商品名"]?.trim() ?? "",
    color: row["カラー名"]?.trim() ?? "",
    size: row["サイズ名"]?.trim() ?? "",
    quantity: Number.isNaN(quantity) ? 1 : quantity,
    totalCost: Number.isNaN(totalCost) ? 0 : totalCost,
    storeName: row["店舗名"]?.trim() ?? "",
    salesAssociate: row["販売担当者"]?.trim() ?? "",
  };
}

/**
 * Parse mark_sales.csv (Japanese headers).
 * Columns: 会員ID, 購買日, 品番, 商品名, カラーコード, カラー名, サイズコード, サイズ名,
 * 店舗ブランドコード, 店舗ブランド略称, 商品ブランドコード, 商品ブランド略称, 購買点数, 税抜金額,
 * brandId from 商品ブランドコード then 店舗ブランドコード; brandName from 略称.
 * VS店舗ID, 店舗名, MS店舗ID, 販売担当者, 担当者コード, 売上ID, 標準小売単価
 */
export function parseMarkSalesCSV(csvText: string): SalesRecord[] {
  const results = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const rows = results.data as Record<string, string>[];
  const transformed: SalesRecord[] = [];

  for (const row of rows) {
    const r = rowToSalesRecord(row);
    if (r) transformed.push(r);
  }

  return transformed;
}

/**
 * Parse mark_sales.csv from a file path using streaming (for large files).
 */
export function parseMarkSalesCSVStream(filePath: string): Promise<SalesRecord[]> {
  return new Promise((resolve, reject) => {
    const transformed: SalesRecord[] = [];
    const stream = createReadStream(filePath, { encoding: "utf-8" });

    Papa.parse(stream, {
      header: true,
      skipEmptyLines: true,
      step: (results) => {
        const data = results.data;
        const rows = Array.isArray(data) ? data : [data];
        for (const row of rows) {
          if (row && typeof row === "object") {
            const r = rowToSalesRecord(row as Record<string, string>);
            if (r) transformed.push(r);
          }
        }
      },
      complete: () => resolve(transformed),
      error: (err) => reject(err),
    });
  });
}

/**
 * Parse mark_memberships.csv (Japanese headers).
 * Columns: ID, 会員ID, 更新日時, 登録日時, ブランドCD, 店舗CD, 店舗ID, 店舗名, 担当者コード, 担当者名, 顧客ランク
 */
export function parseMarkMembershipsCSV(csvText: string): MembershipRecord[] {
  const results = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const rows = results.data as Record<string, string>[];
  const transformed: MembershipRecord[] = [];

  for (const row of rows) {
    const memberId = row["会員ID"]?.trim() ?? "";
    if (!memberId) continue;

    transformed.push({
      memberId,
      brandCode: row["ブランドCD"]?.trim() ?? "",
      storeCode: row["店舗CD"]?.trim() ?? "",
      storeName: row["店舗名"]?.trim() ?? "",
      salesAssociate: row["担当者名"]?.trim() ?? "",
      ranking: row["顧客ランク"]?.trim() ?? "",
    });
  }

  return transformed;
}
