import { cn } from "@/lib/utils"

export const RANK_ORDER: Record<string, number> = {
  ゴールド: 3,
  シルバー: 2,
  ブロンズ: 1,
}

/** Returns the highest-ranking membership, or null if none. */
export function topRanking<T extends { ranking: string }>(
  memberships: T[]
): string | null {
  if (!memberships.length) return null
  const sorted = [...memberships].sort(
    (a, b) => (RANK_ORDER[b.ranking] ?? 0) - (RANK_ORDER[a.ranking] ?? 0)
  )
  return sorted[0].ranking
}

const RANKING_STYLES: Record<string, string> = {
  ゴールド: "bg-[var(--segment-gold)] text-white border-transparent hover:opacity-90",
  シルバー: "bg-[var(--segment-silver)] text-white border-transparent hover:opacity-90",
  ブロンズ: "bg-[var(--segment-bronze)] text-white border-transparent hover:opacity-90",
}

/** Returns className for a ranking badge (colourful segment-style). */
export function rankingBadgeClass(ranking: string): string {
  return cn(
    "text-xs font-medium border",
    RANKING_STYLES[ranking] ?? "bg-secondary text-secondary-foreground"
  )
}
