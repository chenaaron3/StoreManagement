import { useTranslation } from "react-i18next"
import {
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useMemberData } from "@/hooks/useMemberData"
import { useMemberNotes } from "@/hooks/useMemberNotes"
import { getOnlineCart } from "@/data/mockData"
import {
  getNotificationFlags,
  getLastVisit,
  getLastVisits,
  getPurchaseCategoryCounts,
  getRecommendations,
} from "@/lib/associateUtils"
import {
  CustomerDetailModalHeader,
  ShoppingHistorySection,
  NotesSection,
  ProfileSection,
  CouponsSection,
  LastVisitSection,
  OnlineCartSection,
  RecommendationsSection,
} from "@/components/customer-detail"
import { topRanking } from "@/lib/rankingBadge"

interface CustomerDetailModalContentProps {
  memberId: string
}

export function CustomerDetailModalContent({ memberId }: CustomerDetailModalContentProps) {
  const { t } = useTranslation()
  const { data, loading, error } = useMemberData(memberId)
  const { notes, setNotes, saveNotes, isDirty } = useMemberNotes(memberId)

  if (loading && !data) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>{t("customerDetail.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>{t("customerDetail.title")}</DialogTitle>
        </DialogHeader>
        <p className="text-destructive py-4 text-sm">{error}</p>
      </>
    )
  }

  if (!data) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>{t("customerDetail.title")}</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground py-4 text-sm">{t("customerDetail.notFound")}</p>
      </>
    )
  }

  const onlineCartItems = getOnlineCart(data.memberId)
  const flags = getNotificationFlags(
    data.purchases,
    data.birthday,
    data.memberId,
    onlineCartItems.length > 0
  )
  const lastVisit = getLastVisit(data.purchases)
  const visits = getLastVisits(data.purchases, 5)
  const topRank = topRanking(data.memberships)
  const categoryCounts = getPurchaseCategoryCounts(data.purchases)
  const recommendations = getRecommendations(data.purchases)
  const coupons = data.coupons ?? []

  return (
    <>
      <CustomerDetailModalHeader
        name={data.name}
        memberId={data.memberId}
        topRank={topRank}
        flags={flags}
      />

      <div className="max-h-[85vh] space-y-6 overflow-y-auto py-2 pr-2">
        <ProfileSection user={data} />
        <Separator />

        <ShoppingHistorySection user={data} categoryCounts={categoryCounts} />
        <Separator />

        <RecommendationsSection recommendations={recommendations} />
        <Separator />

        <NotesSection
          notes={notes}
          onNotesChange={setNotes}
          onSave={() => saveNotes(notes)}
          isDirty={isDirty}
        />
        <Separator />

        <CouponsSection coupons={coupons} />
        <Separator />

        <LastVisitSection lastVisit={lastVisit} visits={visits} />
        <Separator />

        <OnlineCartSection items={onlineCartItems} />
      </div>
    </>
  )
}
