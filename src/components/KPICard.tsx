import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatNumber } from "@/lib/utils"

interface KPICardProps {
  title: string;
  value: number | string;
  format?: "currency" | "number";
}

export function KPICard({ title, value, format = "number" }: KPICardProps) {
  const display =
    typeof value === "number"
      ? format === "currency"
        ? formatCurrency(value)
        : formatNumber(value)
      : value;

  return (
    <Card className="flex min-w-0 h-full flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground line-clamp-1">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center">
        <p className="truncate text-center text-xl font-bold tabular-nums md:text-2xl">
          {display}
        </p>
      </CardContent>
    </Card>
  );
}
