import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AssociateSidebar } from '@/components/AssociateSidebar';
import { AssociateTodoList } from '@/components/AssociateTodoList';
import { CustomerDetailModalContent } from '@/components/CustomerDetailModalContent';
import { KPICard } from '@/components/KPICard';
import { SalesRankingList } from '@/components/manager/SalesRankingList';
import { StoreSalesTrendChart } from '@/components/manager/StoreSalesTrendChart';
import { MemberCard } from '@/components/MemberCard';
import { PhoneSearchBar } from '@/components/PhoneSearchBar';
import { TopBar } from '@/components/TopBar';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { CURRENT_STORE_NAME } from '@/config/associate';
import { formatCurrency } from '@/lib/utils';
import { loadStoreData } from '@/utils/storeDataLoader';

import type { AssociateTabId } from '@/components/AssociateSidebar';
import type { StoreData } from '@/utils/storeDataLoader';

const MEMBER_IDS = ["AB01862444", "A101866206", "B101017392"]

const SECTION_IDS: Record<AssociateTabId, string> = {
  store: "section-store",
  search: "section-search",
  "in-store": "section-in-store",
  tasks: "section-tasks",
}

export function AssociatePage() {
  const { t } = useTranslation()
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<AssociateTabId>("store")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [storeData, setStoreData] = useState<StoreData | null>(null)
  const [storeLoading, setStoreLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const trendDataFrom2025 = useMemo(() => {
    if (!storeData?.storeTrendDataMonthly) return []
    return storeData.storeTrendDataMonthly.filter((row) => row.date >= "2025-01")
  }, [storeData?.storeTrendDataMonthly])

  useEffect(() => {
    let cancelled = false
    setStoreLoading(true)
    loadStoreData()
      .then((d) => {
        if (!cancelled) setStoreData(d ?? null)
      })
      .finally(() => {
        if (!cancelled) setStoreLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const id = SECTION_IDS[activeTab]
    const el = document.getElementById(id)
    if (el && scrollRef.current) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [activeTab])

  return (
    <div className="flex min-h-screen">
      <AssociateSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onSidebarToggle={() => setSidebarCollapsed((c) => !c)} />
        <main className="min-h-0 flex-1 overflow-y-auto" ref={scrollRef}>
          <div className="mx-auto max-w-5xl space-y-3 px-6 pt-4 pb-4 md:px-8">
            <div className="space-y-1 text-center">
              <p className="text-lg font-semibold tracking-tight">
                {t("sidebar.myDashboard")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("sidebar.branch")}: {CURRENT_STORE_NAME}
              </p>
            </div>

            {/* My Store - Store analytics */}
            <section id={SECTION_IDS.store} className="scroll-mt-6 space-y-2 pb-2">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("associatePage.myStore")}
              </h3>
              {storeLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              ) : storeData ? (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:grid-rows-[180px_180px]">
                  <div className="flex min-h-0 flex-col h-full lg:col-span-2 lg:row-span-2">
                    <StoreSalesTrendChart
                      className="min-h-0 h-full flex-1"
                      data={trendDataFrom2025}
                      seriesKeys={storeData.seriesKeys}
                      granularity="monthly"
                      height={300}
                    />
                  </div>
                  <div className="min-h-[180px] min-w-0 lg:min-h-0">
                    <KPICard
                      title={t("associatePage.storeRevenue")}
                      value={storeData.totalRevenue}
                      format="currency"
                      sparkline={{ data: storeData.revenueSparkline }}
                      compact
                    />
                  </div>
                  <div className="min-h-[180px] min-w-0 lg:min-h-0">
                    <Card className="flex min-h-0 h-full flex-col overflow-hidden">
                      <CardContent className="flex min-h-0 flex-1 flex-col justify-center overflow-auto px-4 pt-0 pb-2">
                        <SalesRankingList
                          items={storeData.topProducts}
                          valueFormatter={(v) => formatCurrency(v)}
                          titleKey="associatePage.topProductsAtStore"
                          maxItems={3}
                          compact
                        />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("associatePage.storeDataUnavailable")}
                </p>
              )}
            </section>

            {/* Currently In Store */}
            <section id={SECTION_IDS["in-store"]} className="scroll-mt-6 space-y-2 pt-2">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("associatePage.inStore")}
              </h3>
              {MEMBER_IDS.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  {t("associatePage.noCustomersCheckedIn")}
                </p>
              ) : (
                <div className="grid gap-6 items-stretch md:grid-cols-2 lg:grid-cols-3">
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

            {/* Search by Phone */}
            <section id={SECTION_IDS.search} className="scroll-mt-6 space-y-2">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("associatePage.searchByPhone")}
              </h3>
              <PhoneSearchBar onMatch={(memberId) => setSelectedMemberId(memberId)} />
            </section>

            {/* Associate Todo Tasks */}
            <section id={SECTION_IDS.tasks} className="scroll-mt-6 space-y-3">
              <AssociateTodoList />
            </section>
          </div>
        </main>
      </div>

      <Dialog
        open={!!selectedMemberId}
        onOpenChange={(open) => !open && setSelectedMemberId(null)}
      >
        <DialogContent className="max-w-7xl max-h-[85vh] overflow-y-auto">
          {selectedMemberId && (
            <CustomerDetailModalContent memberId={selectedMemberId} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
