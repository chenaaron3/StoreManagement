import { LayoutGrid, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const VIEWS = [
  { id: "manager", path: "/manager", label: "Manager", icon: LayoutGrid },
  { id: "associate", path: "/associate", label: "Sales Associate", icon: User },
] as const

export function ViewSwitcher() {
  const location = useLocation()
  const navigate = useNavigate()
  const current = VIEWS.find((v) => v.path === location.pathname) ?? VIEWS[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-9 rounded-full"
          aria-label="Switch view"
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {current.label.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {VIEWS.map((view) => {
          const Icon = view.icon
          const isActive = current.path === view.path
          return (
            <DropdownMenuItem
              key={view.id}
              onClick={() => navigate(view.path)}
              className={isActive ? "bg-accent" : undefined}
            >
              <Icon className="mr-2 size-4" />
              {view.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
