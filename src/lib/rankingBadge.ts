import { cn } from "@/lib/utils"

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
