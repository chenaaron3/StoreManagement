import { useTranslation } from "react-i18next"
import { Section } from "./Section"

interface LastVisitSectionProps {
  lastVisit: {
    salesAssociate: string
    purchaseDate: string
    storeName: string
  } | null
}

export function LastVisitSection({ lastVisit }: LastVisitSectionProps) {
  const { t } = useTranslation()
  const title = lastVisit
    ? t("customerDetail.lastVisitDate", { date: lastVisit.purchaseDate })
    : t("customerDetail.lastVisit")
  return (
    <Section title={title}>
      {lastVisit ? (
        <p className="text-sm">
          {t("customerDetail.helpedBy")}: {lastVisit.salesAssociate} ({lastVisit.storeName})
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">{t("customerDetail.noPurchaseHistory")}</p>
      )}
    </Section>
  )
}
