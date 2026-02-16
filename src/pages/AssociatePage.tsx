import { useState, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { AssociateSidebar, type AssociateTabId } from "@/components/AssociateSidebar"
import { CustomerDetailModalContent } from "@/components/CustomerDetailModalContent"
import { MemberCard } from "@/components/MemberCard"
import { PhoneSearchBar } from "@/components/PhoneSearchBar"
import { AssociateTodoList } from "@/components/AssociateTodoList"
import { CURRENT_STORE_NAME } from "@/config/associate"

const MEMBER_IDS = ["RC01862444", "RC01866206", "RC01017392"]

const SECTION_IDS: Record<AssociateTabId, string> = {
  search: "section-search",
  "in-store": "section-in-store",
  tasks: "section-tasks",
}

export function AssociatePage() {
  const { t } = useTranslation()
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<AssociateTabId>("search")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = SECTION_IDS[activeTab]
    const el = document.getElementById(id)
    if (el && scrollRef.current) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [activeTab])

  return (
    <div className="flex min-h-screen">
      <AssociateSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="min-w-0 flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="mx-auto max-w-5xl space-y-8 px-6 py-8 md:px-8 md:py-10">
          {/* Page title (dashboard + location + branch) */}
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {t("sidebar.myDashboard")}
            </h2>
            <p className="text-muted-foreground mt-1">
              {t("sidebar.branch")}: {CURRENT_STORE_NAME}
            </p>
          </div>
          <Separator />

          {/* Phone Search */}
          <section id={SECTION_IDS.search} className="scroll-mt-6 space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              {t("associatePage.searchByPhone")}
            </h3>
            <PhoneSearchBar onMatch={(memberId) => setSelectedMemberId(memberId)} />
          </section>

          <Separator />

          {/* Currently In Store */}
          <section id={SECTION_IDS["in-store"]} className="scroll-mt-6 space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              {t("associatePage.inStore")}
            </h3>
            {MEMBER_IDS.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                {t("associatePage.noCustomersCheckedIn")}
              </p>
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
          <section id={SECTION_IDS.tasks} className="scroll-mt-6 space-y-4">
            <AssociateTodoList />
          </section>
        </div>
      </main>

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
