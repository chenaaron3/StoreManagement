import { useTranslation } from "react-i18next"
import type { Purchase } from "@/types/data"
import { TableContainer } from "@/components/ui/table-container"
import { formatCurrency } from "@/lib/utils"

interface PurchaseHistoryTableProps {
  purchases: Purchase[]
}

export function PurchaseHistoryTable({ purchases }: PurchaseHistoryTableProps) {
  const { t } = useTranslation()
  const sorted = [...purchases].sort(
    (a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
  )

  if (sorted.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        {t("customerDetail.purchaseHistory")}
      </p>
      <TableContainer>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/60">
              <th className="text-left py-2 px-3 font-medium text-muted-foreground">購買日</th>
              <th className="text-left py-2 px-3 font-medium text-muted-foreground">店舗</th>
              <th className="text-left py-2 px-3 font-medium text-muted-foreground">商品名</th>
              <th className="text-left py-2 px-3 font-medium text-muted-foreground">カラー</th>
              <th className="text-left py-2 px-3 font-medium text-muted-foreground">サイズ</th>
              <th className="text-right py-2 px-3 font-medium text-muted-foreground">金額</th>
              <th className="text-left py-2 px-3 font-medium text-muted-foreground">販売担当者</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, i) => (
              <tr
                key={`${p.purchaseDate}-${p.productId ?? p.itemId}-${i}`}
                className={`border-b border-border ${i % 2 === 1 ? "bg-muted/30" : ""}`}
              >
                <td className="py-2 px-3">{p.purchaseDate}</td>
                <td className="py-2 px-3">{p.storeName ?? "-"}</td>
                <td className="py-2 px-3">{p.productName ?? p.itemName ?? "-"}</td>
                <td className="py-2 px-3">{p.color ?? "-"}</td>
                <td className="py-2 px-3">{p.size ?? "-"}</td>
                <td className="py-2 px-3 text-right tabular-nums">
                  {formatCurrency(p.totalCost ?? 0)}
                </td>
                <td className="py-2 px-3">{p.salesAssociate ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableContainer>
    </div>
  )
}
