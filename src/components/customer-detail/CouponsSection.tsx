import type { Coupon } from "@/types/data"
import { Section } from "./Section"

interface CouponsSectionProps {
  coupons: Coupon[]
}

export function CouponsSection({ coupons }: CouponsSectionProps) {
  return (
    <Section title="Distributed coupons">
      {coupons.length === 0 ? (
        <p className="text-sm text-muted-foreground">No coupons</p>
      ) : (
        <ul className="space-y-2">
          {coupons.map((c) => (
            <li key={c.id} className="rounded-md border px-3 py-2 text-sm">
              <p className="font-medium">{c.name}</p>
              {c.code && (
                <p className="text-muted-foreground">Code: {c.code}</p>
              )}
              <p className="text-muted-foreground">
                {c.discount} · Expires: {c.expiry}
                {c.used ? " · Used" : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
