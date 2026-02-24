import { useTranslation } from "react-i18next"
import type { User } from "@/types/data"
import { getBrandPurchaseCounts } from "@/lib/associateUtils"
import { Section } from "./Section"
import { StoreStatsBlock } from "./StoreStatsBlock"
import { BrandPreferences } from "./BrandPreferences"
import { CategoryTrendChart, type CategoryCount } from "./CategoryTrendChart"
import { PurchaseHistoryTable } from "./PurchaseHistoryTable"

interface ShoppingHistorySectionProps {
  user: User
  categoryCounts: CategoryCount[]
}

export function ShoppingHistorySection({ user, categoryCounts }: ShoppingHistorySectionProps) {
  const { t } = useTranslation()
  const brandCounts = getBrandPurchaseCounts(user.purchases)

  return (
    <Section title={t("customerDetail.customerValue")}>
      <div className="space-y-4">
        <StoreStatsBlock user={user} />
        <BrandPreferences brandCounts={brandCounts} />
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">{t("customerDetail.categoryTrend")}</p>
          <CategoryTrendChart categoryCounts={categoryCounts} />
        </div>
        <PurchaseHistoryTable purchases={user.purchases} />
      </div>
    </Section>
  )
}
