import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useMemberData } from "@/hooks/useMemberData"

interface CustomerDetailModalContentProps {
  memberId: string
}

export function CustomerDetailModalContent({ memberId }: CustomerDetailModalContentProps) {
  const { data, loading, error } = useMemberData(memberId)

  if (loading && !data) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Customer details</DialogTitle>
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
          <DialogTitle>Customer details</DialogTitle>
        </DialogHeader>
        <p className="text-destructive py-4 text-sm">{error}</p>
      </>
    )
  }

  if (!data) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Customer details</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground py-4 text-sm">Customer not found.</p>
      </>
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{data.name || data.memberId}</DialogTitle>
        <DialogDescription>Basic customer info</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-2 text-sm sm:grid-cols-2">
        <div>
          <p className="text-muted-foreground">Member ID</p>
          <p>{data.memberId}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Name</p>
          <p>{data.name}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Phone</p>
          <p>{data.phoneNumber}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Prefecture</p>
          <p>{data.prefecture}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Birthday</p>
          <p>{data.birthday}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Gender</p>
          <p>{data.gender}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Body shape</p>
          <p className="capitalize">{data.bodyShape.replace("_", " ")}</p>
        </div>
      </div>
    </>
  )
}
