import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { CustomerDetailModalContent } from "@/components/CustomerDetailModalContent"
import { MemberCard } from "@/components/MemberCard"

const MEMBER_IDS = ["RC01862444", "RC01866206", "RC01017392"]

export function AssociatePage() {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Sales Associate view
        </h2>
        <p className="text-muted-foreground mt-1">
          Customer insights, purchasing patterns, and recommendations.
        </p>
      </div>

      <Separator />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {MEMBER_IDS.map((id) => (
          <MemberCard
            key={id}
            memberId={id}
            onSelect={() => setSelectedMemberId(id)}
          />
        ))}
      </div>

      <Dialog
        open={!!selectedMemberId}
        onOpenChange={(open) => !open && setSelectedMemberId(null)}
      >
        <DialogContent className="max-w-lg">
          {selectedMemberId && (
            <CustomerDetailModalContent memberId={selectedMemberId} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
