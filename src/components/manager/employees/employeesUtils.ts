import type { EmployeePerformance } from "@/types/analysis";

/** Parse "Brand Location" from store string; store may be "EMODA ルミネエスト新宿" or "ルミネエスト新宿" */
export function parseStoreParts(storeName: string): { brand: string; location: string } {
  const trimmed = storeName.trim();
  const spaceIdx = trimmed.indexOf(" ");
  if (spaceIdx > 0) {
    return { brand: trimmed.slice(0, spaceIdx), location: trimmed.slice(spaceIdx + 1) };
  }
  return { brand: "", location: trimmed };
}

export const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
export const DEFAULT_PAGE_SIZE = 25;

export function extractBrandsAndLocations(
  data: EmployeePerformance[]
): { allBrands: string[]; allLocations: string[] } {
  const brands = new Set<string>();
  const locations = new Set<string>();
  data.forEach((e) => {
    (e.stores ?? []).forEach((s) => {
      if (!s) return;
      const { brand, location } = parseStoreParts(s);
      if (brand) brands.add(brand);
      if (location) locations.add(location);
    });
  });
  return {
    allBrands: Array.from(brands).sort(),
    allLocations: Array.from(locations).sort(),
  };
}
