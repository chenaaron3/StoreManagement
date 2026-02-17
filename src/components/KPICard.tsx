import { Info } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';

export interface KPIRatio {
  label: string
  value: number
  direction: "up" | "down"
}

export interface KPISparkline {
  data: { value: number }[]
}

interface KPICardProps {
  title: string
  value: number | string
  format?: "currency" | "number"
  info?: string
  ratio?: KPIRatio
  sparkline?: KPISparkline
  compact?: boolean
}

function RatioBadge({ ratio }: { ratio: KPIRatio }) {
  const isUp = ratio.direction === "up"
  const Arrow = isUp ? "▲" : "▼"
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs tabular-nums ${isUp ? "text-green-600 dark:text-green-400" : "text-destructive"
        }`}
    >
      {ratio.label} {ratio.value}% {Arrow}
    </span>
  )
}

export function KPICard({
  title,
  value,
  format = "number",
  info,
  ratio,
  sparkline,
  compact,
}: KPICardProps) {
  const display =
    typeof value === "number"
      ? format === "currency"
        ? formatCurrency(value)
        : formatNumber(value)
      : value

  return (
    <Card className={cn("flex min-h-0 min-w-0 h-full flex-col overflow-hidden", compact && "py-3 gap-3")}>
      <CardHeader className={cn("flex flex-row items-center justify-between space-y-0", compact ? "pb-1 pt-2" : "pb-2")}>
        <CardTitle className={`font-medium text-muted-foreground line-clamp-1 ${compact ? "text-xs" : "text-sm"}`}>
          {title}
        </CardTitle>
        {info && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
                aria-label="Info"
              >
                <Info className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{info}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </CardHeader>
      <CardContent className={`flex flex-1 flex-col justify-center gap-1 ${compact ? "min-h-0" : ""}`}>
        <p className={`truncate text-center font-bold tabular-nums ${compact ? "text-base" : "text-xl md:text-2xl"}`}>
          {display}
        </p>
        {ratio && (
          <div className="flex justify-center gap-3 text-xs">
            <RatioBadge ratio={ratio} />
          </div>
        )}
        {sparkline && sparkline.data.length > 0 && (
          <div className={`relative w-full min-w-0 ${compact ? "mt-1.5 h-10" : "mt-3 h-16"}`} style={compact ? { minHeight: 40 } : { minHeight: 64 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkline.data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--chart-1)"
                  fill="var(--chart-1)"
                  fillOpacity={0.3}
                  strokeWidth={1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
