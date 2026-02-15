import type { User } from "@/types/data"
import { getBrandPurchaseCounts } from "@/lib/associateUtils"
import { Section } from "./Section"
import { StoreStatsBlock } from "./StoreStatsBlock"
import { BrandPreferences } from "./BrandPreferences"
import { CategoryTrendChart, type CategoryCount } from "./CategoryTrendChart"

interface ShoppingHistorySectionProps {
  user: User
  categoryCounts: CategoryCount[]
}

export function ShoppingHistorySection({ user, categoryCounts }: ShoppingHistorySectionProps) {
  const brandCounts = getBrandPurchaseCounts(user.purchases)

  return (
    <Section title="Customer value">
      <div className="space-y-4">
        <StoreStatsBlock user={user} />
        <BrandPreferences brandCounts={brandCounts} />
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Category trend</p>
          <CategoryTrendChart categoryCounts={categoryCounts} />
        </div>
      </div>
    </Section>
  )
}
