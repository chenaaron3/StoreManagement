import { BRAND_DISPLAY_NAMES } from "@/config/associate"

interface BrandCount {
  brandCode: string
  count: number
}

interface BrandPreferencesProps {
  brandCounts: BrandCount[]
}

function brandDisplayName(brandCode: string): string {
  return BRAND_DISPLAY_NAMES[brandCode] ?? brandCode
}

export function BrandPreferences({ brandCounts }: BrandPreferencesProps) {
  if (brandCounts.length === 0) return null

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1">Brand preferences</p>
      <p className="text-sm">
        {brandCounts
          .map(({ brandCode, count }) => `${brandDisplayName(brandCode)} (${count})`)
          .join(" · ")}
      </p>
    </div>
  )
}
