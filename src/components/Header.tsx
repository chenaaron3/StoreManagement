import { Separator } from "@/components/ui/separator"
import { ViewSwitcher } from "./ViewSwitcher"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center gap-4 px-4">
        <h1 className="text-lg font-semibold tracking-tight">
          Sales Analytics
        </h1>
        <Separator orientation="vertical" className="h-6" />
        <nav className="flex flex-1 items-center gap-1 text-sm text-muted-foreground" aria-label="View">
          <span className="hidden sm:inline">Switch view</span>
        </nav>
        <ViewSwitcher />
      </div>
    </header>
  )
}
