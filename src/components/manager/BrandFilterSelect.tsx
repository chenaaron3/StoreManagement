import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface BrandOption {
  brandCode: string;
  brandName: string;
}

interface BrandFilterSelectProps {
  selectedBrandCode: string;
  brandOptions: BrandOption[];
  onBrandChange: (code: string) => void;
  /** Prefix for input id (e.g. "sales", "customers") for a11y */
  idPrefix?: string;
}

export function BrandFilterSelect({
  selectedBrandCode,
  brandOptions,
  onBrandChange,
  idPrefix = "view",
}: BrandFilterSelectProps) {
  const { t } = useTranslation();
  const inputId = `${idPrefix}-brand`;

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <select
          id={inputId}
          aria-label={t("employeeFilters.brand")}
          value={selectedBrandCode}
          onChange={(e) => onBrandChange(e.target.value)}
          className="rounded-md border bg-background pl-3 pr-10 py-1.5 text-sm appearance-none"
        >
          <option value="all">{t("employeeFilters.allBrands")}</option>
          {brandOptions.map((b) => (
            <option key={b.brandCode} value={b.brandCode}>
              {b.brandName || b.brandCode}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden>
          <ChevronDown className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}
