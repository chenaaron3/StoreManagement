import { useEffect, useState } from "react";
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
  const [data, setData] = useState<PrecomputedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ManagerTabId>("sales");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    loadPrecomputedData()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load data");
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
          <h2 className="text-2xl font-semibold tracking-tight">Manager view</h2>
          <p className="text-muted-foreground mt-1">Loading analytics...</p>
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
        <h2 className="text-2xl font-semibold tracking-tight">Manager view</h2>
        <p className="text-destructive mt-2">{error}</p>
        <p className="text-muted-foreground text-sm mt-1">
          Run <code className="rounded bg-muted px-1">npm run precompute</code> to generate
          precomputed data, then ensure <code className="rounded bg-muted px-1">public/data/precomputed.json</code> is
          served.
        </p>
      </div>
    ) : data ? (
      <>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Manager view</h2>
          <p className="text-muted-foreground mt-1">
            Insights between brands, aggregation, and trends.
          </p>
        </div>
        <Separator />
        {activeTab === "sales" && <SalesTab data={data} />}
        {activeTab === "brand" && <BrandTab data={data} />}
        {activeTab === "customers" && <CustomersTab data={data} />}
        {activeTab === "product" && <ProductTab data={data} />}
        {activeTab === "stores" && <StoresTab data={data} />}
        {activeTab === "employees" && <EmployeesTab data={data} />}
      </>
    ) : null;

  return (
    <div className="flex min-h-[calc(100vh-8rem)] gap-0">
      <ManagerSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="space-y-8 p-6">{body}</div>
      </main>
    </div>
  );
}
