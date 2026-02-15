import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PrecomputedData } from "@/utils/precomputedDataLoader";
import type { EmployeePerformance } from "@/types/analysis";

interface EmployeesTabProps {
  data: PrecomputedData;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_PAGE_SIZE = 25;

export function EmployeesTab({ data }: EmployeesTabProps) {
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const raw = (data.employeePerformance ?? []) as EmployeePerformance[];
  const safeData = Array.isArray(raw) ? raw : [];

  const allStores = useMemo(() => {
    const set = new Set<string>();
    safeData.forEach((e) => {
      if (e.stores?.length) e.stores.forEach((s) => s && set.add(s));
    });
    return Array.from(set).sort();
  }, [safeData]);

  const filtered = useMemo(() => {
    if (selectedStore === "all") return safeData;
    return safeData.filter(
      (e) => e.stores && e.stores.includes(selectedStore)
    );
  }, [safeData, selectedStore]);

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Employee performance</CardTitle>
              <p className="text-sm text-muted-foreground">
                Revenue by sales associate with store and product breakdown.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="emp-store" className="text-sm text-muted-foreground">
                  Store
                </label>
                <select
                  id="emp-store"
                  value={selectedStore}
                  onChange={(e) => {
                    setSelectedStore(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-md border bg-background px-3 py-1.5 text-sm"
                >
                  <option value="all">All stores</option>
                  {allStores.map((s) => (
                    <option key={s} value={s}>
                      {s}
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
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
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
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={Math.min(400, chartData.length * 28)}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={115}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-lg text-sm">
                        <p className="font-semibold">{d.fullName}</p>
                        <p>Revenue: {formatCurrency(d.revenue)}</p>
                        {d.stores && (
                          <p className="text-muted-foreground mt-1">
                            Stores: {d.stores}
                          </p>
                        )}
                        {d.topProducts && (
                          <p className="text-muted-foreground mt-1 max-w-xs">
                            Top: {d.topProducts}
                          </p>
                        )}
                      </div>
                    );
                  }}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Employee</th>
                  <th className="text-right py-2 font-medium">Revenue</th>
                  <th className="text-left py-2 font-medium">Stores</th>
                  <th className="text-left py-2 font-medium">Top products</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((e) => (
                  <tr key={e.staffCode ?? e.staffName} className="border-b">
                    <td className="py-2">{e.staffName}</td>
                    <td className="text-right py-2">
                      {formatCurrency(e.totalRevenue ?? 0)}
                    </td>
                    <td className="py-2 text-muted-foreground">
                      {(e.stores ?? []).slice(0, 3).join(", ")}
                      {(e.stores?.length ?? 0) > 3 &&
                        ` +${(e.stores?.length ?? 0) - 3} more`}
                    </td>
                    <td className="py-2 text-muted-foreground max-w-[280px] truncate" title={
                      (e.products ?? [])
                        .slice(0, 8)
                        .map((p) => `${p.productName}: ${formatCurrency(p.revenue)}`)
                        .join("; ")
                    }>
                      {(e.products ?? [])
                        .slice(0, 3)
                        .map((p) => p.productName)
                        .join(", ")}
                      {(e.products?.length ?? 0) > 3 &&
                        ` +${(e.products?.length ?? 0) - 3} more`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">
              No employee data.
            </p>
          )}

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
