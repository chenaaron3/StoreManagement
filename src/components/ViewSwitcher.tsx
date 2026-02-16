import { LayoutGrid, User } from "lucide-react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const VIEW_IDS = [
  { id: "manager" as const, pathSuffix: "manager", icon: LayoutGrid },
  { id: "associate" as const, pathSuffix: "associate", icon: User },
]

interface ViewSwitcherProps {
  variant?: "icon" | "full"
  /** Use for dark backgrounds (e.g. sidebar) */
  invert?: boolean
  className?: string
}

export function ViewSwitcher({ variant = "full", invert, className }: ViewSwitcherProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const lang = useParams<{ lang?: string }>().lang ?? "ja"

  const views = VIEW_IDS.map((v) => ({
    ...v,
    path: `/${lang}/${v.pathSuffix}`,
    label: t(`viewSwitcher.${v.id}`),
  }))

  const current =
    views.find((v) => v.path === location.pathname) ?? views[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={variant === "icon" ? "icon" : "sm"}
          className={cn(
            "flex items-center gap-2",
            variant === "icon" && "size-9 rounded-full p-0",
            invert &&
              "text-white hover:bg-white/10 hover:text-white [&_[data-slot=avatar-fallback]]:bg-white/20 [&_[data-slot=avatar-fallback]]:text-white",
            className
          )}
          aria-label={t("viewSwitcher.switchView")}
        >
          <Avatar className={cn("size-8 shrink-0", variant === "icon" && "size-8")}>
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {current.label.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {variant === "full" && (
            <span className="truncate text-sm font-medium">{current.label}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {views.map((view) => {
          const ViewIcon = view.icon
          const isActive = current.path === view.path
          return (
            <DropdownMenuItem
              key={view.id}
              onClick={() => navigate(view.path)}
              className={isActive ? "bg-accent" : undefined}
            >
              <ViewIcon className="mr-2 size-4" />
              {view.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
