import { useTranslation } from "react-i18next"
import type { Coupon } from "@/types/data"
import { Section } from "./Section"

interface CouponsSectionProps {
  coupons: Coupon[]
}

export function CouponsSection({ coupons }: CouponsSectionProps) {
  const { t } = useTranslation()
  return (
    <Section title={t("customerDetail.distributedCoupons")}>
      {coupons.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("customerDetail.noCoupons")}</p>
      ) : (
        <ul className="space-y-2">
          {coupons.map((c) => (
            <li key={c.id} className="rounded-md border px-3 py-2 text-sm">
              <p className="font-medium">{c.name}</p>
              {c.code && (
                <p className="text-muted-foreground">{t("customerDetail.code")}: {c.code}</p>
              )}
              <p className="text-muted-foreground">
                {c.discount} · {t("customerDetail.expires")}: {c.expiry}
                {c.used ? ` · ${t("customerDetail.used")}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
