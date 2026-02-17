import { useTranslation } from "react-i18next"
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
  const { t } = useTranslation()
  if (brandCounts.length === 0) return null

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1">{t("customerDetail.brandPreferences")}</p>
      <p className="text-sm">
        {brandCounts
          .map(({ brandCode, count }) => `${brandDisplayName(brandCode)} (${count})`)
          .join(" · ")}
      </p>
    </div>
  )
}
