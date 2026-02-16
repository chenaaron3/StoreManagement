import { useEffect, useMemo, useState } from "react";
import { useEffectiveData } from "@/hooks/useEffectiveData";
import { useTranslation } from "react-i18next";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ManagerSidebar, type ManagerTabId } from "@/components/ManagerSidebar";
import { loadPrecomputedData } from "@/utils/precomputedDataLoader";
import type { PrecomputedData } from "@/utils/precomputedDataLoader";
import {
  SalesTab,
  BrandTab,
  CustomersTab,
  ProductTab,
  StoresTab,
  EmployeesTab,
} from "@/components/manager";

export function ManagerPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<PrecomputedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ManagerTabId>("sales");
  const [brandFilter, setBrandFilter] = useState<string>("all");

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
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {t(`managerPage.tabs.${activeTab}.title`)}
          </h2>
          <p className="text-muted-foreground mt-1">{t("common.loading")}</p>
        </div>
        <Separator />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </>
    ) : error ? (
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {t(`managerPage.tabs.${activeTab}.title`)}
        </h2>
        <p className="text-destructive mt-2">{error}</p>
        <p className="text-muted-foreground text-sm mt-1">
          {t("managerPage.error.precomputeHint", {
            cmd1: "npm run precompute",
            path: "public/data/precomputed.json",
          })}
        </p>
      </div>
    ) : effectiveData ? (
      (() => {
        const tabData: PrecomputedData = effectiveData!;
        return (
          <>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                {t(`managerPage.tabs.${activeTab}.title`)}
              </h2>
              <p className="text-muted-foreground mt-1">
                {brandFilter !== "all"
                  ? `${brandOptions.find((b) => b.brandCode === brandFilter)?.brandName ?? ""} – ${t(`managerPage.tabs.${activeTab}.subtitle`)}`
                  : t(`managerPage.tabs.${activeTab}.subtitle`)}
              </p>
            </div>
            <Separator />
            {activeTab === "sales" && (
              <SalesTab
                data={tabData}
                brandFilter={brandFilter}
                onBrandFilterChange={setBrandFilter}
                brandOptions={brandOptions}
              />
            )}
            {activeTab === "brand" && data && <BrandTab data={data} />}
            {activeTab === "customers" && (
              <CustomersTab
                data={tabData}
                brandFilter={brandFilter}
                onBrandFilterChange={setBrandFilter}
                brandOptions={brandOptions}
              />
            )}
            {activeTab === "product" && (
              <ProductTab
                data={tabData}
                brandFilter={brandFilter}
                onBrandFilterChange={setBrandFilter}
                brandOptions={brandOptions}
              />
            )}
            {activeTab === "stores" && (
              <StoresTab
                data={tabData}
                brandFilter={brandFilter}
                onBrandFilterChange={setBrandFilter}
                brandOptions={brandOptions}
              />
            )}
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
        brandFilter={brandFilter}
        onBrandFilterChange={setBrandFilter}
        brandOptions={brandOptions}
      />
      <main className="min-w-0 flex-1">
        <div className="space-y-8 px-6 pt-6">{body}</div>
      </main>
    </div>
  );
}
