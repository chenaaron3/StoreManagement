import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { PrecomputedData } from "@/utils/precomputedDataLoader";

interface ProductTabProps {
  data: PrecomputedData;
}

export function ProductTab({ data: _data }: ProductTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product</CardTitle>
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
