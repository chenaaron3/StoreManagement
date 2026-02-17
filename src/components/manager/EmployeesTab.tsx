import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ExportCsvButton } from '@/components/ExportCsvButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency } from '@/lib/utils';

import {
    DEFAULT_PAGE_SIZE, EmployeeFilters, EmployeePagination, EmployeePerformanceChart,
    EmployeePerformanceTable, extractBrandsAndLocations, parseStoreParts
} from './employees';

import type { PrecomputedData } from "@/utils/precomputedDataLoader";
import type { EmployeePerformance } from "@/types/analysis";
interface EmployeesTabProps {
  data: PrecomputedData;
  /** Brand code from sidebar filter; used to preselect Brand filter */
  brandFilter: string;
}

export function EmployeesTab({ data, brandFilter }: EmployeesTabProps) {
  const { t } = useTranslation();
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const brandNameForFilter = useMemo(() => {
    const perf = (data.brandPerformance ?? []).find(
      (b: { brandCode: string; brandName: string }) => b.brandCode === brandFilter
    );
    return perf?.brandName ?? "";
  }, [data.brandPerformance, brandFilter]);

  useEffect(() => {
    if (brandNameForFilter) {
      setSelectedBrand(brandNameForFilter);
    }
  }, [brandFilter, brandNameForFilter]);

  const raw = (data.employeePerformance ?? []) as EmployeePerformance[];
  const safeData = Array.isArray(raw) ? raw : [];

  const { allBrands, allLocations } = useMemo(
    () => extractBrandsAndLocations(safeData),
    [safeData]
  );

  const filtered = useMemo(() => {
    return safeData.filter((e) => {
      const stores = e.stores ?? [];
      const brandMatch =
        selectedBrand === "all" ||
        stores.some((s) => parseStoreParts(s).brand === selectedBrand);
      const locationMatch =
        selectedLocation === "all" ||
        stores.some((s) => parseStoreParts(s).location === selectedLocation);
      return brandMatch && locationMatch;
    });
  }, [safeData, selectedBrand, selectedLocation]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const chartData = paginated.map((e) => ({
    name: e.staffName.length > 30 ? `${e.staffName.slice(0, 30)}…` : e.staffName,
    fullName: e.staffName,
    revenue: e.totalRevenue ?? 0,
    stores: (e.stores ?? []).join(", "),
    topProducts: (e.products ?? [])
      .slice(0, 5)
      .map((p) => `${p.productName}: ${formatCurrency(p.revenue)}`)
      .join("; "),
  }));

  const handleBrandChange = (v: string) => {
    setSelectedBrand(v);
    setPage(1);
  };

  const handleLocationChange = (v: string) => {
    setSelectedLocation(v);
    setPage(1);
  };

  const handlePageSizeChange = (v: number) => {
    setPageSize(v);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>{t("employeesTab.title")}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {t("employeesTab.subtitle")}
              </p>
            </div>
            <EmployeeFilters
              selectedBrand={selectedBrand}
              selectedLocation={selectedLocation}
              pageSize={pageSize}
              allBrands={allBrands}
              allLocations={allLocations}
              onBrandChange={handleBrandChange}
              onLocationChange={handleLocationChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="max-w-5xl mx-auto">
            <EmployeePerformanceChart data={chartData} />
          </div>
          <div className="flex justify-end">
            <ExportCsvButton />
          </div>
          <EmployeePerformanceTable data={paginated} />

          {filtered.length === 0 && (
            <EmptyState>{t("employeesTab.noData")}</EmptyState>
          )}

          <EmployeePagination
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalCount={filtered.length}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
