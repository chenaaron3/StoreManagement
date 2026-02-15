import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("ja-JP").format(value);
}

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{display}</p>
      </CardContent>
    </Card>
  );
}
