import { useTranslation } from "react-i18next"
import { formatCurrency } from "@/lib/utils"
import { Section } from "./Section"

interface Recommendation {
  itemName: string
  price: number
}

interface RecommendationsSectionProps {
  recommendations: Recommendation[]
}

export function RecommendationsSection({
  recommendations,
}: RecommendationsSectionProps) {
  const { t } = useTranslation()
  return (
    <Section title={t("customerDetail.recommendedForYou")}>
      {recommendations.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("customerDetail.noRecommendations")}</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {recommendations.map((r, i) => (
            <li key={i}>
              {r.itemName} · <span className="font-medium text-price">{formatCurrency(r.price)}</span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
