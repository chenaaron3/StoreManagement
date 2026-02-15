import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { User } from "@/types/data"
import { CURRENT_STORE_BRAND } from "@/config/associate"
import { getOnlineCart } from "@/data/mockData"
import {
  getNotificationFlags,
  getLastVisit,
  getPurchasesInLast6Months,
  getRecommendations,
} from "@/lib/associateUtils"
import { rankingBadgeClass } from "@/lib/rankingBadge"

interface MemberCardContentProps {
  user: User
}

const RANK_ORDER: Record<string, number> = { ゴールド: 3, シルバー: 2, ブロンズ: 1 }

function topRanking(memberships: User["memberships"]): string | null {
  if (!memberships.length) return null
  const sorted = [...memberships].sort(
    (a, b) => (RANK_ORDER[b.ranking] ?? 0) - (RANK_ORDER[a.ranking] ?? 0)
  )
  return sorted[0].ranking
}

const SECTION_TITLE_CLASS = "text-sm font-medium text-muted-foreground"

export function MemberCardContent({ user }: MemberCardContentProps) {
  const onlineCartItems = getOnlineCart(user.memberId)
  const flags = getNotificationFlags(
    user.purchases,
    user.birthday,
    user.memberId,
    onlineCartItems.length > 0
  )
  const lastVisit = getLastVisit(user.purchases)
  const purchasesInBrand = user.purchases.filter(
    (p) => p.brandCode === CURRENT_STORE_BRAND
  ).length
  const inLast6Months = getPurchasesInLast6Months(user.purchases)
  const topRank = topRanking(user.memberships)
  const recommendations = getRecommendations(user.purchases).slice(0, 2)
  const recentPurchases = user.purchases
    .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
    .slice(0, 2)

  return (
    <Card className="cursor-pointer gap-2 bg-transparent shadow-none">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">{user.name || user.memberId}</CardTitle>
          {flags.birthday && (
            <Badge variant="outline" className="text-xs bg-[var(--segment-birthday)]/15 text-[var(--segment-birthday)] border-[var(--segment-birthday)]/40">
              Birthday this month
            </Badge>
          )}
          {topRank && (
            <Badge className={rankingBadgeClass(topRank)}>{topRank}</Badge>
          )}
          {flags.crossStore && (
            <Badge variant="outline" className="text-xs bg-[var(--segment-opportunity)]/15 text-[var(--segment-opportunity)] border-[var(--segment-opportunity)]/40">
              Cross-store
            </Badge>
          )}
          {flags.ecBrowse && (
            <Badge variant="outline" className="text-xs bg-[var(--segment-silver)]/15 text-[var(--segment-silver)] border-[var(--segment-silver)]/40">
              EC browse
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground text-sm mt-1">Member ID: {user.memberId}</p>
      </CardHeader>
      <CardContent className="space-y-4 pt-0 text-sm">
        {/* Customer value — same as detail StoreStatsBlock */}
        <div>
          <h4 className={SECTION_TITLE_CLASS}>Customer value</h4>
          <p className="mt-2">
            {user.purchases.length} purchase{user.purchases.length !== 1 ? "s" : ""} total · {inLast6Months} in the last 6 months
            {purchasesInBrand !== user.purchases.length && (
              <> · {purchasesInBrand} in my brand</>
            )}
          </p>
        </div>

        {/* Recommended for you — same as detail, price styling */}
        <div>
          <h4 className={SECTION_TITLE_CLASS}>Recommended for you</h4>
          <div className="mt-2">
            {recommendations.length === 0 ? (
              <p className="text-muted-foreground">No recommendations yet</p>
            ) : (
              <ul className="space-y-1">
                {recommendations.map((r, i) => (
                  <li key={i}>
                    {r.itemName} · <span className="font-medium text-price">¥{r.price.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Last visit — same title/body as detail LastVisitSection */}
        <div>
          <h4 className={SECTION_TITLE_CLASS}>
            {lastVisit ? `Last visit · ${lastVisit.purchaseDate}` : "Last visit"}
          </h4>
          <div className="mt-2">
            {lastVisit ? (
              <p>Helped by: {lastVisit.salesAssociate} ({lastVisit.storeName})</p>
            ) : (
              <p className="text-muted-foreground">No purchase history</p>
            )}
          </div>
        </div>

        {/* Recent purchases — price styling to match detail */}
        <div>
          <h4 className={SECTION_TITLE_CLASS}>Recent purchases</h4>
          <div className="mt-2">
            {recentPurchases.length === 0 ? (
              <p className="text-muted-foreground">No purchases yet</p>
            ) : (
              <ul className="space-y-1">
                {recentPurchases.map((s, i) => (
                  <li key={i}>
                    {s.itemName} · <span className="font-medium text-price">¥{s.totalCost.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
