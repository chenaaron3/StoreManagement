import { useTranslation } from "react-i18next";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface RankingItem {
  rank: number;
  name: string;
  value: number;
}

interface SalesRankingListProps {
  items: RankingItem[];
  valueFormatter?: (v: number) => string;
  maxItems?: number;
  titleKey?: string;
  compact?: boolean;
}

const RANK_BADGE_STYLES: Record<number, string> = {
  1: "bg-[#1a365d] text-white",
  2: "bg-[#2c5282] text-white",
  3: "bg-[#2b6cb0] text-white",
};

export function SalesRankingList({
  items,
  valueFormatter = (v) => formatNumber(v),
  maxItems = 7,
  titleKey = "salesTab.salesRanking",
  compact,
}: SalesRankingListProps) {
  const { t } = useTranslation();
  const shown = items.slice(0, maxItems);

  return (
    <div className={compact ? "space-y-1.5 px-1" : "space-y-3 px-2"}>
      <h3 className={compact ? "text-xs font-medium text-muted-foreground" : "text-sm font-medium text-muted-foreground"}>
        {t(titleKey)}
      </h3>
      <ul className={compact ? "space-y-1" : "space-y-3"}>
        {shown.map((item) => (
          <li
            key={`${item.rank}-${item.name}`}
            className={cn(
              "flex items-center rounded-md transition-colors hover:bg-muted/50",
              compact ? "gap-2 py-1 px-2" : "gap-3 py-2 px-3"
            )}
          >
            <span
              className={cn(
                "flex shrink-0 items-center justify-center rounded-full text-xs font-medium",
                compact ? "size-5" : "size-7",
                RANK_BADGE_STYLES[item.rank] ?? "bg-muted text-muted-foreground"
              )}
            >
              {item.rank}
            </span>
            <span className={cn("min-w-0 flex-1 truncate font-medium", compact ? "text-xs" : "text-sm")} title={item.name}>
              {item.name}
            </span>
            <span className={cn("shrink-0 tabular-nums text-muted-foreground", compact ? "text-xs" : "text-sm")}>
              {valueFormatter(item.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
