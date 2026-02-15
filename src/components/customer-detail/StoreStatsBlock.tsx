import type { User } from "@/types/data"
import { CURRENT_STORE_BRAND } from "@/config/associate"
import { getPurchasesInLast6Months } from "@/lib/associateUtils"

interface StoreStatsBlockProps {
  user: User
}

export function StoreStatsBlock({ user }: StoreStatsBlockProps) {
  const purchasesInBrand = user.purchases.filter(
    (p) => p.brandCode === CURRENT_STORE_BRAND
  ).length
  const inLast6Months = getPurchasesInLast6Months(user.purchases)

  return (
    <div>
      <p className="text-sm">
        {user.purchases.length} purchase{user.purchases.length !== 1 ? "s" : ""} total · {inLast6Months} in the last 6 months
        {purchasesInBrand !== user.purchases.length && (
          <> · {purchasesInBrand} in my brand</>
        )}
      </p>
    </div>
  )
}
