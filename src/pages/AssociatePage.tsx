import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { CustomerDetailModalContent } from "@/components/CustomerDetailModalContent"
import { MemberCard } from "@/components/MemberCard"
import { PhoneSearchBar } from "@/components/PhoneSearchBar"
import { AssociateTodoList } from "@/components/AssociateTodoList"

const MEMBER_IDS = ["RC01862444", "RC01866206", "RC01017392"]

export function AssociatePage() {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-8 md:px-8 md:py-10">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          My dashboard
        </h2>
        <p className="text-muted-foreground">
          Customer insights, purchasing patterns, and recommendations.
        </p>
      </header>

      <Separator />

      {/* Phone Search */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Search by phone</h3>
        <PhoneSearchBar onMatch={(memberId) => setSelectedMemberId(memberId)} />
      </section>

      <Separator />

      {/* Currently In Store — directly below search */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Currently in store</h3>
        {MEMBER_IDS.length === 0 ? (
          <p className="text-muted-foreground text-sm">No customers checked in</p>
        ) : (
          <div className="grid gap-6 items-start md:grid-cols-2 lg:grid-cols-3">
            {MEMBER_IDS.map((id) => (
              <MemberCard
                key={id}
                memberId={id}
                onSelect={() => setSelectedMemberId(id)}
              />
            ))}
          </div>
        )}
      </section>

      <Separator />

      {/* Associate Todo Tasks */}
      <section className="space-y-4">
        <AssociateTodoList />
      </section>

      <Dialog
        open={!!selectedMemberId}
        onOpenChange={(open) => !open && setSelectedMemberId(null)}
      >
        <DialogContent className="max-w-2xl">
          {selectedMemberId && (
            <CustomerDetailModalContent memberId={selectedMemberId} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
