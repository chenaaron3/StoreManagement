/**
 * Internal rank (S/A/B/C) based on lifetime value percentile distribution.
 * S = top 5%, A = next 15%, B = next 30%, C = bottom 50%.
 * Distinct from customer-facing ゴールド/シルバー/ブロンズ.
 */

export const RANK_PERCENTILES = {
  S: 0.95,  // Top 5% (95th–100th)
  A: 0.80,  // Next 15% (80th–95th)
  B: 0.50,  // Next 30% (50th–80th)
  // C = bottom 50% (0–50th)
} as const;

export type InternalRank = "S" | "A" | "B" | "C";

/**
 * Assigns S/A/B/C ranks from LTV using percentile distribution.
 * Sorted by totalRevenue descending; top 5% = S, next 15% = A, next 30% = B, rest = C.
 */
export function assignRanksByLtvPercentile(
  totalRevenueByMember: Map<string, number>
): Map<string, InternalRank> {
  const result = new Map<string, InternalRank>();
  if (totalRevenueByMember.size === 0) return result;

  const entries = Array.from(totalRevenueByMember.entries());
  entries.sort((a, b) => b[1] - a[1]);
  const n = entries.length;

  const idxS = Math.max(0, Math.ceil(n * (1 - RANK_PERCENTILES.S)) - 1);
  const idxA = Math.max(0, Math.ceil(n * (1 - RANK_PERCENTILES.A)) - 1);
  const idxB = Math.max(0, Math.ceil(n * (1 - RANK_PERCENTILES.B)) - 1);

  entries.forEach(([memberId], i) => {
    let rank: InternalRank = "C";
    if (i <= idxS) rank = "S";
    else if (i <= idxA) rank = "A";
    else if (i <= idxB) rank = "B";
    result.set(memberId, rank);
  });
  return result;
}
