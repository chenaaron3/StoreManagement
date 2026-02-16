import { useTranslation } from "react-i18next"
import type { OnlineCartItem } from "@/types/data"
import { formatCurrency } from "@/lib/utils"
import { Section } from "./Section"

interface OnlineCartSectionProps {
  items: OnlineCartItem[]
}

export function OnlineCartSection({ items }: OnlineCartSectionProps) {
  const { t } = useTranslation()
  return (
    <Section title={t("customerDetail.itemsInCart")}>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("customerDetail.noItemsInCart")}</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.id}>
              {item.itemName}
              {item.quantity != null && item.quantity > 1 && ` × ${item.quantity}`}
              {" · "}
              <span className="font-medium text-price">{formatCurrency(item.price)}</span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
