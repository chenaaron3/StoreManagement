import {
  ITEMS_PER_PAGE_OPTIONS,
} from "./employeesUtils";

interface EmployeeFiltersProps {
  selectedBrand: string;
  selectedLocation: string;
  pageSize: number;
  allBrands: string[];
  allLocations: string[];
  onBrandChange: (v: string) => void;
  onLocationChange: (v: string) => void;
  onPageSizeChange: (v: number) => void;
}

export function EmployeeFilters({
  selectedBrand,
  selectedLocation,
  pageSize,
  allBrands,
  allLocations,
  onBrandChange,
  onLocationChange,
  onPageSizeChange,
}: EmployeeFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <label htmlFor="emp-brand" className="text-sm text-muted-foreground">
          Brand
        </label>
        <select
          id="emp-brand"
          value={selectedBrand}
          onChange={(e) => onBrandChange(e.target.value)}
          className="rounded-md border bg-background px-3 py-1.5 text-sm"
        >
          <option value="all">All brands</option>
          {allBrands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="emp-location" className="text-sm text-muted-foreground">
          Location
        </label>
        <select
          id="emp-location"
          value={selectedLocation}
          onChange={(e) => onLocationChange(e.target.value)}
          className="rounded-md border bg-background px-3 py-1.5 text-sm"
        >
          <option value="all">All locations</option>
          {allLocations.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="emp-per-page" className="text-sm text-muted-foreground">
          Per page
        </label>
        <select
          id="emp-per-page"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-md border bg-background px-3 py-1.5 text-sm"
        >
          {ITEMS_PER_PAGE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
