import type { Purchase } from "@/types/data"
import { CURRENT_STORE_NAME, CURRENT_STORE_CODE } from "@/config/associate"
import { mockRecommendationItems } from "@/data/mockData"

/** Whether the customer's birthday falls in the current month. */
export function isBirthdayThisMonth(birthday: string): boolean {
  if (!birthday) return false
  const [, month] = birthday.split("-").map(Number)
  const now = new Date()
  return month === now.getMonth() + 1
}

/** Last visit info from purchases (most recent by purchaseDate). */
export function getLastVisit(purchases: Purchase[]): {
  salesAssociate: string
  purchaseDate: string
  storeName: string
} | null {
  if (!purchases.length) return null
  const sorted = [...purchases].sort(
    (a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
  )
  const last = sorted[0]
  return {
    salesAssociate: last.salesAssociate,
    purchaseDate: last.purchaseDate,
    storeName: last.storeName,
  }
}

const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000

/** Count purchases in the last 6 months from a reference date (default now). */
export function getPurchasesInLast6Months(
  purchases: Purchase[],
  refDate: Date = new Date()
): number {
  const cutoff = refDate.getTime() - SIX_MONTHS_MS
  return purchases.filter((p) => new Date(p.purchaseDate).getTime() >= cutoff).length
}

/** Purchase counts by brand (brandCode). Sorted by count descending. */
export function getBrandPurchaseCounts(
  purchases: Purchase[]
): { brandCode: string; count: number }[] {
  const counts: Record<string, number> = {}
  for (const p of purchases) {
    const code = p.brandCode ?? p.brandId ?? ""
    if (code) counts[code] = (counts[code] ?? 0) + 1
  }
  return Object.entries(counts)
    .map(([brandCode, count]) => ({ brandCode, count }))
    .sort((a, b) => b.count - a.count)
}

/** Category keywords (itemName) -> display label. */
const CATEGORY_KEYWORDS: Record<string, string> = {
  スカート: "Skirts",
  ドレス: "Dresses",
  ブラウス: "Blouses",
  ジャケット: "Jackets",
  パンツ: "Pants",
  ニット: "Knitwear",
  コート: "Coats",
}

/** Count purchases by category (keyword match on itemName). */
export function getPurchaseCategoryCounts(
  purchases: Purchase[]
): { category: string; label: string; count: number }[] {
  const counts: Record<string, number> = {}
  for (const keyword of Object.keys(CATEGORY_KEYWORDS)) {
    counts[keyword] = 0
  }
  for (const p of purchases) {
    const name = p.itemName ?? p.productName ?? ""
    for (const keyword of Object.keys(CATEGORY_KEYWORDS)) {
      if (name.includes(keyword)) {
        counts[keyword] = (counts[keyword] ?? 0) + 1
        break
      }
    }
  }
  return Object.entries(CATEGORY_KEYWORDS)
    .map(([keyword, label]) => ({ category: keyword, label, count: counts[keyword] ?? 0 }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)
}

/** Notification flags for a customer (birthday, cross-store purchase, EC browse).
 * Cross-store: has purchased at another store (different storeCode, e.g. EMODA).
 * EC browse is true only when the customer has items in their online cart. */
export function getNotificationFlags(
  purchases: Purchase[],
  birthday: string,
  _memberId: string,
  hasOnlineCartItems: boolean = false
): { birthday: boolean; crossStore: boolean; ecBrowse: boolean } {
  const birthdayFlag = isBirthdayThisMonth(birthday)
  const crossStore = purchases.some((p) =>
    p.storeCode != null
      ? p.storeCode !== CURRENT_STORE_CODE
      : p.storeName !== CURRENT_STORE_NAME
  )
  const ecBrowse = hasOnlineCartItems
  return { birthday: birthdayFlag, crossStore, ecBrowse }
}

/** Recommended items for plus-one / cross-sell based on purchase categories (mock). */
export function getRecommendations(purchases: Purchase[]): { itemName: string; price: number }[] {
  const categoryCounts = getPurchaseCategoryCounts(purchases)
  const topCategory = categoryCounts[0]?.category
  if (!topCategory) return mockRecommendationItems.slice(0, 2).map(({ itemName, price }) => ({ itemName, price }))
  const byCategory = mockRecommendationItems.filter((r) => r.category === topCategory)
  const fallback = mockRecommendationItems.slice(0, 2)
  const items = byCategory.length >= 2 ? byCategory.slice(0, 2) : [...byCategory, ...fallback].slice(0, 2)
  return items.map(({ itemName, price }) => ({ itemName, price }))
}
