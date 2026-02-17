import {
    ChevronLeft, ChevronRight, LayoutDashboard, Package, Store, Tag, UserCog, Users
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcher } from './LanguageSwitcher';
import { ViewSwitcher } from './ViewSwitcher';

export type ManagerTabId =
  | "sales"
  | "customers"
  | "product"
  | "stores"
  | "employees"
  | "brand";

export interface BrandOption {
  brandCode: string;
  brandName: string;
}

const NAV_ITEMS: { id: ManagerTabId; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "sales", icon: LayoutDashboard },
  { id: "customers", icon: Users },
  { id: "product", icon: Package },
  { id: "stores", icon: Store },
  { id: "employees", icon: UserCog },
  { id: "brand", icon: Tag },
];

const SIDEBAR_LABELS: Record<ManagerTabId, string> = {
  sales: "sidebar.sales",
  customers: "sidebar.customers",
  product: "sidebar.product",
  stores: "sidebar.stores",
  employees: "sidebar.employees",
  brand: "sidebar.brand",
};

interface ManagerSidebarProps {
  activeTab: ManagerTabId;
  onTabChange: (tab: ManagerTabId) => void;
  brandFilter: string;
  onBrandFilterChange: (brandCode: string) => void;
  brandOptions: BrandOption[];
}

export function ManagerSidebar({
  activeTab,
  onTabChange,
  brandFilter,
  onBrandFilterChange,
  brandOptions,
}: ManagerSidebarProps) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

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

      {/* Brand filter */}
      <div className={`shrink-0 border-b border-white/10 px-3 py-3 ${collapsed ? "px-2" : ""}`}>
        <div className={collapsed ? "flex justify-center" : ""}>
          <select
            value={brandFilter}
            onChange={(e) => onBrandFilterChange(e.target.value)}
            className={`w-full rounded-lg border-0 bg-white/10 pl-3 pr-10 py-2 text-sm text-white focus:ring-1 focus:ring-white/30 [appearance:none] bg-[length:12px_12px] bg-[right_0.75rem_center] bg-no-repeat ${collapsed ? "max-w-[52px] truncate" : ""
              }`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            }}
            title={t("sidebar.brandFilter")}
          >
            <option value="all">{collapsed ? "All" : t("sidebar.allBrands")}</option>
            {brandOptions.map((b) => (
              <option key={b.brandCode} value={b.brandCode}>
                {collapsed && b.brandName.length > 6
                  ? `${b.brandName.slice(0, 6)}…`
                  : b.brandName}
              </option>
            ))}
          </select>
        </div>
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
          className={`flex w-full items-center gap-3 rounded-lg py-2.5 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white transition-colors ${collapsed ? "justify-center px-2" : "px-3"
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
  );
}
