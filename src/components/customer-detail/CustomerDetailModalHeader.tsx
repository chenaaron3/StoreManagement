import { useTranslation } from "react-i18next"
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { rankingBadgeClass } from "@/lib/rankingBadge"

interface NotificationFlags {
  birthday: boolean
  crossStore: boolean
  ecBrowse: boolean
}

interface CustomerDetailModalHeaderProps {
  name: string
  memberId: string
  topRank: string | null
  flags: NotificationFlags
}

export function CustomerDetailModalHeader({
  name,
  memberId,
  topRank,
  flags,
}: CustomerDetailModalHeaderProps) {
  const { t } = useTranslation()
  return (
    <DialogHeader>
      <div className="flex flex-wrap items-center gap-2">
        <DialogTitle>{name || memberId}</DialogTitle>
        {flags.birthday && (
          <Badge variant="outline" className="bg-[var(--segment-birthday)]/15 text-[var(--segment-birthday)] border-[var(--segment-birthday)]/40">
            {t("memberCard.birthdayThisMonth")}
          </Badge>
        )}
        {topRank && (
          <Badge className={rankingBadgeClass(topRank)}>{topRank}</Badge>
        )}
        {flags.crossStore && (
          <Badge variant="outline" className="bg-[var(--segment-opportunity)]/15 text-[var(--segment-opportunity)] border-[var(--segment-opportunity)]/40">
            {t("memberCard.crossStore")}
          </Badge>
        )}
        {flags.ecBrowse && (
          <Badge variant="outline" className="bg-[var(--segment-silver)]/15 text-[var(--segment-silver)] border-[var(--segment-silver)]/40">
            {t("memberCard.ecBrowse")}
          </Badge>
        )}
      </div>
      <DialogDescription>{t("common.memberId")}: {memberId}</DialogDescription>
    </DialogHeader>
  )
}
