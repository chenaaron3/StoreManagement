import type { OnlineCartItem } from "@/types/data"
import { Section } from "./Section"

interface OnlineCartSectionProps {
  items: OnlineCartItem[]
}

export function OnlineCartSection({ items }: OnlineCartSectionProps) {
  return (
    <Section title="Items in online cart">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No items in cart</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.id}>
              {item.itemName}
              {item.quantity != null && item.quantity > 1 && ` × ${item.quantity}`}
              {" · "}
              <span className="font-medium text-price">¥{item.price.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
