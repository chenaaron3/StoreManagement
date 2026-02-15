import { Section } from "./Section"

interface LastVisitSectionProps {
  lastVisit: {
    salesAssociate: string
    purchaseDate: string
    storeName: string
  } | null
}

export function LastVisitSection({ lastVisit }: LastVisitSectionProps) {
  const title = lastVisit ? `Last visit · ${lastVisit.purchaseDate}` : "Last visit"
  return (
    <Section title={title}>
      {lastVisit ? (
        <p className="text-sm">
          Helped by: {lastVisit.salesAssociate} ({lastVisit.storeName})
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">No purchase history</p>
      )}
    </Section>
  )
}
