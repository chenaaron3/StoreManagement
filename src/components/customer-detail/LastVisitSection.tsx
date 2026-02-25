import { useTranslation } from "react-i18next"
import { TableContainer } from "@/components/ui/table-container"
import { Section } from "./Section"
import type { VisitInfo } from "@/lib/associateUtils"

interface LastVisitSectionProps {
  lastVisit: VisitInfo | null
  visits?: VisitInfo[]
}

export function LastVisitSection({ lastVisit, visits }: LastVisitSectionProps) {
  const { t } = useTranslation()
  const list = (visits && visits.length > 0) ? visits : (lastVisit ? [lastVisit] : [])

  return (
    <Section title={t("customerDetail.lastVisit")}>
      {list.length > 0 ? (
        <TableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/60">
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">前回来店日</th>
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">店舗</th>
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">販売担当者</th>
              </tr>
            </thead>
            <tbody>
              {list.map((v, i) => (
                <tr
                  key={`${v.purchaseDate}-${v.storeName}-${i}`}
                  className={`border-b border-border ${i % 2 === 1 ? "bg-muted/30" : ""}`}
                >
                  <td className="py-2 px-3">{v.purchaseDate}</td>
                  <td className="py-2 px-3">{v.storeName || "-"}</td>
                  <td className="py-2 px-3">{v.salesAssociate || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableContainer>
      ) : (
        <p className="text-sm text-muted-foreground">{t("customerDetail.noPurchaseHistory")}</p>
      )}
    </Section>
  )
}
