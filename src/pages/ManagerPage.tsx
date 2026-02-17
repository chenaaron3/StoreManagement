import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
    BrandTab, CustomersTab, EmployeesTab, ProductTab, SalesTab, StoresTab
} from '@/components/manager';
import { BrandFilterSelect } from '@/components/manager/BrandFilterSelect';
import { ManagerSidebar, type ManagerTabId } from '@/components/ManagerSidebar';
import { TopBar } from '@/components/TopBar';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffectiveData } from '@/hooks/useEffectiveData';
import { loadPrecomputedData } from '@/utils/precomputedDataLoader';

import type { PrecomputedData } from "@/utils/precomputedDataLoader";
export function ManagerPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<PrecomputedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ManagerTabId>("sales");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const brandOptions = useMemo(() => {
    if (!data?.brandPerformance) return [];
    return data.brandPerformance.map((b) => ({
      brandCode: b.brandCode,
      brandName: b.brandName || b.brandCode,
    }));
  }, [data?.brandPerformance]);

  const effectiveData = useEffectiveData(data, brandFilter);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    loadPrecomputedData()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : t("managerPage.error.loadFailed"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const body =
    loading ? (
      <>
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </>
    ) : error ? (
      <div className="flex flex-col gap-2">
        <p className="text-destructive">{error}</p>
        <p className="text-muted-foreground text-sm">
          {t("managerPage.error.precomputeHint", {
            cmd1: "npm run anonymize-sales",
            path: "public/data/precomputed.json",
          })}
        </p>
      </div>
    ) : effectiveData ? (
      (() => {
        const tabData: PrecomputedData = effectiveData!;
        return (
          <>
            <p className="text-center text-lg font-semibold tracking-tight">
              {brandFilter !== "all"
                ? `${brandOptions.find((b) => b.brandCode === brandFilter)?.brandName ?? ""} – ${t(`managerPage.tabs.${activeTab}.subtitle`)}`
                : t(`managerPage.tabs.${activeTab}.subtitle`)}
            </p>
            {activeTab !== "employees" && (
              <div className="flex justify-end">
                <BrandFilterSelect
                  selectedBrandCode={brandFilter}
                  brandOptions={brandOptions}
                  onBrandChange={setBrandFilter}
                  idPrefix="manager"
                />
              </div>
            )}
            {activeTab === "sales" && <SalesTab data={tabData} />}
            {activeTab === "brand" && data && <BrandTab data={data} />}
            {activeTab === "customers" && <CustomersTab data={tabData} />}
            {activeTab === "product" && <ProductTab data={tabData} />}
            {activeTab === "stores" && <StoresTab data={tabData} />}
            {activeTab === "employees" && <EmployeesTab data={tabData} brandFilter={brandFilter} />}
          </>
        );
      })()
    ) : null;

  return (
    <div className="flex min-h-screen">
      <ManagerSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onSidebarToggle={() => setSidebarCollapsed((c) => !c)} />
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-6 px-6 pt-6">{body}</div>
        </main>
      </div>
    </div>
  );
}
