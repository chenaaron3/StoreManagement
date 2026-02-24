import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { VisitInfo } from "@/lib/associateUtils"

interface LastVisitSectionProps {
  lastVisit: VisitInfo | null
  visits?: VisitInfo[]
}

export function LastVisitSection({ lastVisit, visits }: LastVisitSectionProps) {
  const { t } = useTranslation()
  const list = (visits && visits.length > 0) ? visits : (lastVisit ? [lastVisit] : [])

  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          {lastVisit ? `前回来店・${lastVisit.purchaseDate}` : t("customerDetail.lastVisit")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {list.length > 0 ? (
          list.map((v, i) => (
            <p key={`${v.purchaseDate}-${v.storeName}-${i}`} className="text-sm">
              {v.purchaseDate} — {t("customerDetail.helpedBy")}: {v.salesAssociate} ({v.storeName})
            </p>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">{t("customerDetail.noPurchaseHistory")}</p>
        )}
      </CardContent>
    </Card>
  )
}
