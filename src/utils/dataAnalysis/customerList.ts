/**
 * Build customer list and purchases for Customer Master (from CSV pipeline).
 * No real customer names; use memberId or "会員 {suffix}" for display.
 */
import type { SalesRecord } from "@/types/data";
import type { Purchase } from "@/types/data";
import type { CustomerListItem } from "@/types/analysis";
import { getCustomerDetails } from "./customerDetails";
import { assignRanksByLtvPercentile } from "@/config/internalRank";

/** Demographics from member_demographics.json */
export type CustomerDemographics = Record<
  string,
  { birthdate: string; genderCode: string }
>;

/** Compute age from birthdate (YYYY-MM-DD). Returns null if invalid. */
function ageFromBirthdate(birthdate: string): number | null {
  const m = birthdate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const birth = new Date(
    parseInt(m[1], 10),
    parseInt(m[2], 10) - 1,
    parseInt(m[3], 10)
  );
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
  ) {
    age--;
  }
  return age >= 0 ? age : null;
}

/** Build preferredBrand, preferredStore (within preferred brand), and salesAssociate per member. */
function buildPreferredBrandAndAssociate(
  sales: SalesRecord[]
): {
  preferredBrand: Map<string, string>;
  preferredStore: Map<string, string>;
  salesAssociate: Map<string, string>;
} {
  const byMemberBrand = new Map<string, Map<string, number>>();
  const byMemberBrandStore = new Map<string, Map<string, Map<string, number>>>();
  const byMemberAssoc = new Map<string, Map<string, number>>();
  sales.forEach((s) => {
    if (s.totalCost <= 0 || !s.memberId) return;
    const code = (s.brandId ?? s.brandCode)?.trim() || "";
    const store = (s.storeName ?? "").trim();
    if (code) {
      if (!byMemberBrand.has(s.memberId)) byMemberBrand.set(s.memberId, new Map());
      const m = byMemberBrand.get(s.memberId)!;
      m.set(code, (m.get(code) || 0) + s.totalCost);
      if (store) {
        if (!byMemberBrandStore.has(s.memberId)) byMemberBrandStore.set(s.memberId, new Map());
        const brandMap = byMemberBrandStore.get(s.memberId)!;
        if (!brandMap.has(code)) brandMap.set(code, new Map());
        const storeMap = brandMap.get(code)!;
        storeMap.set(store, (storeMap.get(store) || 0) + s.totalCost);
      }
    }
    const a = s.salesAssociate?.trim();
    if (a) {
      if (!byMemberAssoc.has(s.memberId)) byMemberAssoc.set(s.memberId, new Map());
      const m = byMemberAssoc.get(s.memberId)!;
      m.set(a, (m.get(a) || 0) + 1);
    }
  });
  const preferredBrand = new Map<string, string>();
  byMemberBrand.forEach((brands, mid) => {
    const best = Array.from(brands.entries()).sort((a, b) => b[1] - a[1])[0];
    if (best) preferredBrand.set(mid, best[0]);
  });
  const preferredStore = new Map<string, string>();
  byMemberBrandStore.forEach((brandMap, mid) => {
    const brand = preferredBrand.get(mid);
    if (!brand) return;
    const storeMap = brandMap.get(brand);
    if (!storeMap || storeMap.size === 0) return;
    const best = Array.from(storeMap.entries()).sort((a, b) => b[1] - a[1])[0];
    if (best) preferredStore.set(mid, best[0]);
  });
  const salesAssociate = new Map<string, string>();
  byMemberAssoc.forEach((assocs, mid) => {
    const best = Array.from(assocs.entries()).sort((a, b) => b[1] - a[1])[0];
    if (best) salesAssociate.set(mid, best[0]);
  });
  return { preferredBrand, preferredStore, salesAssociate };
}

export function getCustomerList(
  sales: SalesRecord[],
  demographics: CustomerDemographics | null
): CustomerListItem[] {
  const details = getCustomerDetails(sales);
  const totalRevenueByMember = new Map<string, number>();
  details.forEach((d, memberId) => totalRevenueByMember.set(memberId, d.totalRevenue));
  const rankByMember = assignRanksByLtvPercentile(totalRevenueByMember);
  const { preferredBrand, preferredStore, salesAssociate } = buildPreferredBrandAndAssociate(sales);

  return Array.from(details.entries()).map(([memberId, d]) => {
    const internalRank = rankByMember.get(memberId) ?? "C";
    const demo = demographics?.[memberId];
    const age = demo?.birthdate ? ageFromBirthdate(demo.birthdate) : null;
    const genderDisplay =
      demo?.genderCode === "1" ? "女性" : demo?.genderCode === "2" ? "男性" : "";
    return {
      memberId,
      displayName: `会員 ${memberId.slice(-6)}`,
      gender: genderDisplay,
      age,
      totalRevenue: d.totalRevenue,
      transactionCount: d.transactionCount,
      firstPurchaseDate: d.firstPurchaseDate,
      lastPurchaseDate: d.lastPurchaseDate,
      preferredStore: preferredStore.get(memberId) ?? d.preferredStore ?? "",
      preferredBrand: preferredBrand.get(memberId) ?? "",
      salesAssociate: salesAssociate.get(memberId) ?? "",
      internalRank,
    };
  });
}

/** Build customerPurchases: Record<memberId, Purchase[]> from sales. */
export function getCustomerPurchases(
  sales: SalesRecord[]
): Record<string, Purchase[]> {
  const map: Record<string, Purchase[]> = {};
  sales
    .filter((s) => s.totalCost > 0 && s.memberId)
    .forEach((s) => {
      const { memberId, ...rest } = s;
      if (!map[memberId]) map[memberId] = [];
      map[memberId].push(rest as Purchase);
    });
  return map;
}
