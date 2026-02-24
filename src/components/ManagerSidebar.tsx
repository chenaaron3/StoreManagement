import { BookOpen, LayoutDashboard, Package, Store, Tag, UserCog, Users } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcher } from './LanguageSwitcher';

export type ManagerTabId =
  | "sales"
  | "customers"
  | "customerMaster"
  | "product"
  | "stores"
  | "employees"
  | "brand";

const NAV_ITEMS: { id: ManagerTabId; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "sales", icon: LayoutDashboard },
  { id: "customers", icon: Users },
  { id: "customerMaster", icon: BookOpen },
  { id: "product", icon: Package },
  { id: "stores", icon: Store },
  { id: "employees", icon: UserCog },
  { id: "brand", icon: Tag },
];

const SIDEBAR_LABELS: Record<ManagerTabId, string> = {
  sales: "sidebar.sales",
  customers: "sidebar.customers",
  customerMaster: "sidebar.customerMaster",
  product: "sidebar.product",
  stores: "sidebar.stores",
  employees: "sidebar.employees",
  brand: "sidebar.brand",
};

interface ManagerSidebarProps {
  activeTab: ManagerTabId;
  onTabChange: (tab: ManagerTabId) => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function ManagerSidebar({
  activeTab,
  onTabChange,
  collapsed: controlledCollapsed,
  onCollapsedChange: _onCollapsedChange,
}: ManagerSidebarProps) {
  const { t } = useTranslation();
  const [internalCollapsed] = useState(false);
  const collapsed = controlledCollapsed ?? internalCollapsed;

  return (
    <aside
      className="sticky top-0 flex min-h-screen flex-col shrink-0 self-start rounded-none border-r border-[#1a2030] bg-[#232A3B] text-white transition-[width] duration-200"
      style={{ width: collapsed ? 72 : 240 }}
    >
      {/* Header */}
      <div
        className={`flex h-14 shrink-0 items-center border-b border-white/10 ${collapsed ? "justify-center px-2" : "justify-between gap-2 px-4"
          }`}
      >
        {collapsed ? (
          <span className="text-lg font-bold tracking-tight">S</span>
        ) : (
          <>
            <span className="text-lg font-bold tracking-tight">Sales Analytics</span>
            <LanguageSwitcher />
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ id, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onTabChange(id)}
                  className={`relative flex w-full items-center gap-3 rounded-lg py-2.5 text-left text-sm font-medium transition-colors ${isActive
                    ? "bg-[#384152] text-white"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                    } ${collapsed ? "justify-center px-2" : "pl-3 pr-3"}`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-8 w-0.5 -translate-y-1/2 rounded-r bg-blue-500" aria-hidden />
                  )}
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  {!collapsed && <span>{t(SIDEBAR_LABELS[id])}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

    </aside>
  );
}
