import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { PrecomputedData } from "@/utils/precomputedDataLoader";

interface CustomersTabProps {
  data: PrecomputedData;
}

export function CustomersTab({ data: _data }: CustomersTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
        <p className="text-sm text-muted-foreground">
          Charts and tables for this section will be wired next.
        </p>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  );
}
