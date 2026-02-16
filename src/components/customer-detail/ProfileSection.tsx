import { useTranslation } from "react-i18next"
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

function getGenderKey(gender: string): string {
  if (gender === "1") return "genderMale"
  if (gender === "2") return "genderFemale"
  return "genderUndefined"
}

function getBodyShapeKey(shape: string): string {
  const k = shape.replace("_", "").toLowerCase()
  if (k === "straight") return "bodyStraight"
  if (k === "wavy") return "bodyWavy"
  if (k === "natural") return "bodyNatural"
  return "bodyUnknown"
}

export function ProfileSection({ user }: ProfileSectionProps) {
  const { t } = useTranslation()
  const size = getMostRecentSize(user.purchases)

  return (
    <Section title={t("customerDetail.profile")}>
      <div className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <p className="text-muted-foreground">{t("common.memberId")}</p>
          <p>{user.memberId}</p>
        </div>
        <div>
          <p className="text-muted-foreground">{t("customerDetail.name")}</p>
          <p>{user.name}</p>
        </div>
        <div>
          <p className="text-muted-foreground">{t("customerDetail.phone")}</p>
          <p>{user.phoneNumber}</p>
        </div>
        <div>
          <p className="text-muted-foreground">{t("customerDetail.prefecture")}</p>
          <p>{user.prefecture}</p>
        </div>
        <div>
          <p className="text-muted-foreground">{t("customerDetail.birthday")}</p>
          <p>{user.birthday}</p>
        </div>
        <div>
          <p className="text-muted-foreground">{t("customerDetail.gender")}</p>
          <p>{t(`customerDetail.${getGenderKey(user.gender)}`)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">{t("customerDetail.bodyShape")}</p>
          <p>{t(`customerDetail.${getBodyShapeKey(user.bodyShape)}`)}</p>
        </div>
        {size != null && (
          <div>
            <p className="text-muted-foreground">{t("customerDetail.size")}</p>
            <p>{size}</p>
          </div>
        )}
      </div>
    </Section>
  )
}
