import type { User } from "@/types/data"
import { Section } from "./Section"

/** Most recent purchase size (by purchaseDate), or null if no purchases. */
function getMostRecentSize(purchases: User["purchases"]): string | null {
  if (!purchases.length) return null
  const sorted = [...purchases].sort(
    (a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
  )
  return sorted[0].size ?? null
}

interface ProfileSectionProps {
  user: User
}

export function ProfileSection({ user }: ProfileSectionProps) {
  const size = getMostRecentSize(user.purchases)

  return (
    <Section title="Profile">
      <div className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <p className="text-muted-foreground">Member ID</p>
          <p>{user.memberId}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Name</p>
          <p>{user.name}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Phone</p>
          <p>{user.phoneNumber}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Prefecture</p>
          <p>{user.prefecture}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Birthday</p>
          <p>{user.birthday}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Gender</p>
          <p>
            {user.gender === "1" ? "M" : user.gender === "2" ? "F" : "Undefined"}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Body shape</p>
          <p className="capitalize">{user.bodyShape.replace("_", " ")}</p>
        </div>
        {size != null && (
          <div>
            <p className="text-muted-foreground">Size</p>
            <p>{size}</p>
          </div>
        )}
      </div>
    </Section>
  )
}
