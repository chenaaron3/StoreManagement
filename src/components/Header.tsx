import { useLocation } from "react-router-dom"
import { ViewSwitcher } from "./ViewSwitcher"
import { CURRENT_STORE_NAME } from "@/config/associate"

export function Header() {
  const location = useLocation()
  const isAssociate = location.pathname === "/associate"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 w-full items-center justify-between gap-4 px-4 md:px-6">
        <h1 className="text-lg font-semibold tracking-tight">
          Store Management
        </h1>
        <div className="flex items-center gap-4">
          {isAssociate && (
            <span className="text-muted-foreground text-sm">
              Location: 金沢 · Branch: {CURRENT_STORE_NAME}
            </span>
          )}
          <ViewSwitcher />
        </div>
      </div>
    </header>
  )
}
