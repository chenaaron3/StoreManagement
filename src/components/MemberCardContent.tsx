import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { User } from "@/types/data"

interface MemberCardContentProps {
  user: User
}

export function MemberCardContent({ user }: MemberCardContentProps) {
  return (
    <Card className="cursor-pointer border-transparent bg-transparent shadow-none">
      <CardHeader>
        <CardTitle className="text-base">{user.name || user.memberId}</CardTitle>
        <CardDescription>Profile & activity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <p className="text-muted-foreground">Profile</p>
          <p>{user.prefecture} · {user.birthday} · {user.gender}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Membership</p>
          {user.memberships.length === 0 ? (
            <p className="text-muted-foreground">—</p>
          ) : (
            user.memberships.map((m, i) => (
              <p key={i}>{m.storeName} · {m.ranking}</p>
            ))
          )}
        </div>
        <div>
          <p className="text-muted-foreground">Purchases ({user.purchases.length})</p>
          {user.purchases.length === 0 ? (
            <p className="text-muted-foreground">—</p>
          ) : (
            <ul className="mt-1 space-y-0.5">
              {user.purchases.slice(0, 3).map((s, i) => (
                <li key={i}>{s.itemName} · ¥{s.totalCost.toLocaleString()}</li>
              ))}
              {user.purchases.length > 3 && (
                <li className="text-muted-foreground">+{user.purchases.length - 3} more</li>
              )}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
