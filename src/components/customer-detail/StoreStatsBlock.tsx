import { useTranslation } from "react-i18next"
import type { User } from "@/types/data"
import { CURRENT_STORE_BRAND } from "@/config/associate"
import { getPurchasesInLast6Months } from "@/lib/associateUtils"

interface StoreStatsBlockProps {
  user: User
}

export function StoreStatsBlock({ user }: StoreStatsBlockProps) {
  const { t } = useTranslation()
  const purchasesInBrand = user.purchases.filter(
    (p) => (p.brandCode ?? p.brandId) === CURRENT_STORE_BRAND
  ).length
  const inLast6Months = getPurchasesInLast6Months(user.purchases)

  return (
    <div>
      <p className="text-sm">
        {t("memberCard.purchasesTotal", { total: user.purchases.length, inLast6: inLast6Months })}
        {purchasesInBrand !== user.purchases.length && (
          <> · {purchasesInBrand} {t("memberCard.inMyBrand")}</>
        )}
      </p>
    </div>
  )
}
