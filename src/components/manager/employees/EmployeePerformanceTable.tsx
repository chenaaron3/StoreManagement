import type { EmployeePerformance } from "@/types/analysis";
import { formatCurrency } from "@/lib/utils";

interface EmployeePerformanceTableProps {
  data: EmployeePerformance[];
}

export function EmployeePerformanceTable({ data }: EmployeePerformanceTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 pr-4 font-medium">Employee</th>
            <th className="text-right py-2 px-4 font-medium">Revenue</th>
            <th className="text-left py-2 pl-4 pr-4 font-medium">Stores</th>
            <th className="text-left py-2 pl-4 font-medium">Top products</th>
          </tr>
        </thead>
        <tbody>
          {data.map((e) => (
            <tr key={e.staffCode ?? e.staffName} className="border-b">
              <td className="py-2 pr-4">{e.staffName}</td>
              <td className="text-right py-2 px-4 whitespace-nowrap">
                {formatCurrency(e.totalRevenue ?? 0)}
              </td>
              <td className="py-2 pl-4 pr-4 text-muted-foreground">
                {(e.stores ?? []).slice(0, 3).join(", ")}
                {(e.stores?.length ?? 0) > 3 &&
                  ` +${(e.stores?.length ?? 0) - 3} more`}
              </td>
              <td
                className="py-2 pl-4 text-muted-foreground max-w-[280px] truncate"
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
                  ` +${(e.products?.length ?? 0) - 3} more`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
