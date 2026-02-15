import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Package,
  Store,
  UserCog,
  Tag,
  Sun,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export type ManagerTabId =
  | "sales"
  | "customers"
  | "product"
  | "stores"
  | "employees"
  | "brand";

const NAV_ITEMS: { id: ManagerTabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "sales", label: "Sales", icon: LayoutDashboard },
  { id: "customers", label: "Customers", icon: Users },
  { id: "product", label: "Product", icon: Package },
  { id: "stores", label: "Stores", icon: Store },
  { id: "employees", label: "Employees", icon: UserCog },
  { id: "brand", label: "Brand", icon: Tag },
];

interface ManagerSidebarProps {
  activeTab: ManagerTabId;
  onTabChange: (tab: ManagerTabId) => void;
}

export function ManagerSidebar({ activeTab, onTabChange }: ManagerSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="flex flex-col shrink-0 h-[calc(100vh-8rem)] rounded-br-2xl border-r border-[#1a2030] bg-[#232A3B] text-white shadow-lg transition-[width] duration-200"
      style={{ width: collapsed ? 72 : 240 }}
    >
      {/* Header */}
      <div
        className={`flex h-14 shrink-0 items-center border-b border-white/10 ${
          collapsed ? "justify-center px-2" : "justify-between gap-2 px-4"
        }`}
      >
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight">Mark</span>
        )}
        <div className={`flex items-center gap-2 ${collapsed ? "" : "ml-auto"}`}>
          <button
            type="button"
            aria-label="Theme"
            className="rounded-md p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Sun className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Language"
            className="rounded-md p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <span className="text-base leading-none">🇯🇵</span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
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
                  {!collapsed && <span>{label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

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
            <ChevronRight className="h-5 w-5 shrink-0" aria-label="Expand sidebar" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5 shrink-0" aria-hidden />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
