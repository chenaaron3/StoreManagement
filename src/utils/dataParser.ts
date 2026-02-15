import Papa from "papaparse";
import type { SalesRecord } from "@/types/data";
import type { MembershipRecord } from "@/types/data";

/**
 * Parse mark_sales.csv (Japanese headers).
 * Columns: 会員ID, 購買日, 品番, 商品名, カラーコード, カラー名, サイズコード, サイズ名,
 * 店舗ブランドコード, 店舗ブランド略称, 商品ブランドコード, 商品ブランド略称, 購買点数, 税抜金額,
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
    const memberId = row["会員ID"]?.trim() ?? "";
    const purchaseDate = row["購買日"]?.trim() ?? "";
    if (!memberId || !purchaseDate) continue;

    const quantity = parseFloat(row["購買点数"] ?? "0") || 1;
    const totalCost = parseFloat(row["税抜金額"] ?? "0") || 0;
    const brandCode = row["店舗ブランド略称"]?.trim() || row["商品ブランド略称"]?.trim() || "";

    transformed.push({
      memberId,
      purchaseDate,
      itemId: row["品番"]?.trim() ?? "",
      itemName: row["商品名"]?.trim() ?? "",
      color: row["カラー名"]?.trim() ?? "",
      size: row["サイズ名"]?.trim() ?? "",
      brandCode,
      quantity: Number.isNaN(quantity) ? 1 : quantity,
      totalCost: Number.isNaN(totalCost) ? 0 : totalCost,
      storeName: row["店舗名"]?.trim() ?? "",
      salesAssociate: row["販売担当者"]?.trim() ?? "",
    });
  }

  return transformed;
}

/**
 * Parse mark_transactions.csv (Japanese headers).
 * Columns: ID, 会員ID, 更新日時, 登録日時, ブランドCD, 店舗CD, 店舗ID, 店舗名, 担当者コード, 担当者名, 顧客ランク
 */
export function parseMarkTransactionsCSV(csvText: string): MembershipRecord[] {
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
