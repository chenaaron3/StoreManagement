import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  Users,
  ListTodo,
} from "lucide-react"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { ViewSwitcher } from "./ViewSwitcher"
import { CURRENT_STORE_NAME } from "@/config/associate"

export type AssociateTabId = "search" | "in-store" | "tasks"

const NAV_IDS: {
  id: AssociateTabId
  labelKey: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { id: "search", labelKey: "searchByPhone", icon: Phone },
  { id: "in-store", labelKey: "inStore", icon: Users },
  { id: "tasks", labelKey: "tasksAssigned", icon: ListTodo },
]

interface AssociateSidebarProps {
  activeTab: AssociateTabId
  onTabChange: (tab: AssociateTabId) => void
}

export function AssociateSidebar({ activeTab, onTabChange }: AssociateSidebarProps) {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className="sticky top-0 flex min-h-screen flex-col shrink-0 self-start rounded-none border-r border-[#1a2030] bg-[#232A3B] text-white transition-[width] duration-200"
      style={{ width: collapsed ? 72 : 240 }}
    >
      {/* Header */}
      <div
        className={`shrink-0 border-b border-white/10 py-3 px-4 ${
          collapsed ? "flex justify-center items-center px-2" : ""
        }`}
      >
        {!collapsed ? (
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5 min-w-0">
              <span className="text-lg font-bold tracking-tight">
                {t("sidebar.myDashboard")}
              </span>
              <p className="text-xs text-white/60">
                {t("sidebar.location")}: 金沢
                <br />
                {t("sidebar.branch")}: {CURRENT_STORE_NAME}
              </p>
            </div>
            <LanguageSwitcher className="shrink-0" />
          </div>
        ) : (
          <span className="text-lg font-bold tracking-tight">A</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <ul className="space-y-0.5">
          {NAV_IDS.map(({ id, labelKey, icon: Icon }) => {
            const isActive = activeTab === id
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onTabChange(id)}
                  className={`relative flex w-full items-center gap-3 rounded-lg py-2.5 text-left text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#384152] text-white"
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                  } ${collapsed ? "justify-center px-2" : "pl-3 pr-3"}`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-8 w-0.5 -translate-y-1/2 rounded-r bg-blue-500" aria-hidden />
                  )}
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  {!collapsed && <span>{t(`sidebar.${labelKey}`)}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User (ViewSwitcher) */}
      <div className={`shrink-0 border-t border-white/10 p-2 ${collapsed ? "flex justify-center" : ""}`}>
        <ViewSwitcher
          variant={collapsed ? "icon" : "full"}
          invert
          className={collapsed ? "justify-center rounded-lg py-2" : "w-full justify-start rounded-lg py-2"}
        />
      </div>

      {/* Collapse */}
      <div className="shrink-0 border-t border-white/10 p-2">
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className={`flex w-full items-center gap-3 rounded-lg py-2.5 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white transition-colors ${
            collapsed ? "justify-center px-2" : "px-3"
          }`}
        >
          {collapsed ? (
            <ChevronRight
              className="h-5 w-5 shrink-0"
              aria-label={t("common.expandSidebar")}
            />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5 shrink-0" aria-hidden />
              <span>{t("sidebar.collapse")}</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
