import { useTranslation } from 'react-i18next';

import { TableContainer } from '@/components/ui/table-container';
import { formatCurrency } from '@/lib/utils';

import type { EmployeePerformance } from "@/types/analysis";
interface EmployeePerformanceTableProps {
  data: EmployeePerformance[];
}

export function EmployeePerformanceTable({ data }: EmployeePerformanceTableProps) {
  const { t } = useTranslation();
  return (
    <TableContainer>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/60">
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t("employeesTab.employee")}</th>
            <th className="text-right py-3 px-4 font-medium text-muted-foreground">{t("employeesTab.revenue")}</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t("employeesTab.stores")}</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t("employeesTab.topProducts")}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((e, i) => (
            <tr key={e.staffCode ?? e.staffName} className={`border-b border-border ${i % 2 === 1 ? "bg-muted/30" : ""} hover:bg-muted/40 transition-colors`}>
              <td className="py-3 px-4 font-medium">{e.staffName}</td>
              <td className="text-right py-3 px-4 whitespace-nowrap tabular-nums">
                {formatCurrency(e.totalRevenue ?? 0)}
              </td>
              <td className="py-3 px-4 text-muted-foreground">
                {(e.stores ?? []).slice(0, 3).join(", ")}
                {(e.stores?.length ?? 0) > 3 &&
                  ` +${t("common.more", { count: (e.stores?.length ?? 0) - 3 })}`}
              </td>
              <td
                className="py-3 px-4 text-muted-foreground max-w-[280px] truncate"
                title={(e.products ?? [])
                  .slice(0, 8)
                  .map((p) => `${p.productName}: ${formatCurrency(p.revenue)}`)
                  .join("; ")}
              >
                {(e.products ?? [])
                  .slice(0, 3)
                  .map((p) => p.productName)
                  .join(", ")}
                {(e.products?.length ?? 0) > 3 &&
                  ` +${t("common.more", { count: (e.products?.length ?? 0) - 3 })}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableContainer>
  );
}
