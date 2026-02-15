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
  return (
    <Section title="Recommended for you">
      {recommendations.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recommendations yet</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {recommendations.map((r, i) => (
            <li key={i}>
              {r.itemName} · <span className="font-medium text-price">¥{r.price.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
