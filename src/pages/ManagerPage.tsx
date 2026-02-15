import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export function ManagerPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Manager view</h2>
        <p className="text-muted-foreground mt-1">
          Insights between brands, aggregation, and trends.
        </p>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <PlaceholderCard
          title="Brand comparison"
          description="Compare performance across brands"
        />
        <PlaceholderCard
          title="Aggregated KPIs"
          description="Key metrics and rollups"
        />
        <PlaceholderCard
          title="Trends"
          description="Time-series and patterns"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data aggregation</CardTitle>
          <CardDescription>
            Cross-brand metrics and rollups. Data will be hooked up later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PlaceholderCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  )
}
