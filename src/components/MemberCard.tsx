import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useMemberData } from "@/hooks/useMemberData"
import { MemberCardContent } from "./MemberCardContent"

interface MemberCardProps {
  memberId: string
  onSelect: () => void
}

export function MemberCard({ memberId, onSelect }: MemberCardProps) {
  const { data, loading, error } = useMemberData(memberId)

  if (loading && !data) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive text-sm">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-sm">Member not found.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex h-full min-h-0 w-full flex-col text-left transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-xl"
    >
      <MemberCardContent user={data} />
    </button>
  )
}
