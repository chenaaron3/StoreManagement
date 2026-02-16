import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PrecomputedData } from "@/utils/precomputedDataLoader";
import { formatCurrency } from "@/lib/utils";

interface BrandTabProps {
  data: PrecomputedData;
}

export function BrandTab({ data }: BrandTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand performance</CardTitle>
        <p className="text-sm text-muted-foreground">
          Revenue and metrics by brand (top brands).
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">Brand</th>
                <th className="text-right py-2 font-medium">Revenue</th>
                <th className="text-right py-2 font-medium">Transactions</th>
                <th className="text-right py-2 font-medium">Customers</th>
                <th className="text-right py-2 font-medium">AOV</th>
                <th className="text-right py-2 font-medium">Stores</th>
              </tr>
            </thead>
            <tbody>
              {data.brandPerformance.slice(0, 14).map((b) => (
                <tr key={b.brandCode} className="border-b">
                  <td className="py-2">{b.brandName || b.brandCode}</td>
                  <td className="text-right py-2">{formatCurrency(b.totalRevenue)}</td>
                  <td className="text-right py-2">{b.transactions.toLocaleString()}</td>
                  <td className="text-right py-2">{b.customers.toLocaleString()}</td>
                  <td className="text-right py-2">{formatCurrency(b.averageOrderValue)}</td>
                  <td className="text-right py-2">{b.storeCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
