import {
    Bell, LayoutGrid, LogIn, LogOut, Menu, Package, Search, Store, Tag, User
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CURRENT_STORE_NAME } from '@/config/associate';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchResults } from '@/hooks/useSearchResults';
import type { SearchResult, SearchResultType } from '@/hooks/useSearchResults';
import { cn, formatCurrency } from '@/lib/utils';

const NOTIFICATION_KEYS = [
  { id: "1", titleKey: "header.notification1Title", timeKey: "header.notification1Time" },
  { id: "2", titleKey: "header.notification2Title", timeKey: "header.notification2Time" },
] as const;

interface TopBarProps {
  onSidebarToggle?: () => void;
}

export function TopBar({ onSidebarToggle }: TopBarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const { isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set());
  const searchInputRef = useRef<HTMLInputElement>(null);
  const results = useSearchResults(searchQuery, lang ?? "ja");

  const handleLogout = () => {
    logout();
    navigate(`/${lang ?? "ja"}/login`, { replace: true });
  };

  const handleLogin = () => {
    navigate(`/${lang ?? "ja"}/login`);
  };

  const handleSearchSelect = useCallback(
    (result: SearchResult) => {
      navigate(result.path);
      setSearchQuery("");
      setSearchOpen(false);
    },
    [navigate]
  );

  useEffect(() => {
    const keydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, []);

  const typeIcon = (type: SearchResultType) => {
    switch (type) {
      case "brand":
        return <Tag className="size-4 shrink-0 text-muted-foreground" />;
      case "store":
        return <Store className="size-4 shrink-0 text-muted-foreground" />;
      case "product":
        return <Package className="size-4 shrink-0 text-muted-foreground" />;
    }
  };

  const typeLabel = (type: SearchResultType) => {
    switch (type) {
      case "brand":
        return t("sidebar.brand");
      case "store":
        return t("storesTab.store");
      case "product":
        return t("productTab.productCol");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 w-full items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {onSidebarToggle ? (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={onSidebarToggle}
              aria-label={t("common.toggleSidebar")}
            >
              <Menu className="size-5" />
            </Button>
          ) : (
            <h1 className="shrink-0 text-lg font-semibold tracking-tight">
              {t("header.siteTitle")}
            </h1>
          )}
          <Popover
            open={searchOpen}
            onOpenChange={(open) => {
              if (!open) setSearchOpen(false);
              else if (searchQuery.trim()) setSearchOpen(true);
            }}
          >
            <PopoverTrigger asChild>
              <div
                className="relative flex min-w-0 flex-1 max-w-md cursor-text"
                onClick={() => searchInputRef.current?.focus()}
              >
                <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  ref={searchInputRef}
                  placeholder={t("search.placeholder")}
                  value={searchQuery}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSearchQuery(v);
                    setSearchOpen(!!v.trim());
                  }}
                  className="h-9 pl-3 pr-9"
                />
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] p-0"
              align="start"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="max-h-64 overflow-y-auto py-2">
                {results.length === 0 ? (
                  <p className="px-4 py-4 text-sm text-muted-foreground">
                    {searchQuery.trim() ? t("search.noResults") : t("search.typeToSearch")}
                  </p>
                ) : (
                  <ul className="space-y-0.5">
                    {results.map((r) => (
                      <li key={r.id}>
                        <button
                          type="button"
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted/50"
                          onClick={() => handleSearchSelect(r)}
                        >
                          {typeIcon(r.type)}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{r.name}</p>
                            <p className="text-xs text-muted-foreground">{typeLabel(r.type)}</p>
                          </div>
                          {r.revenue != null && (
                            <span className="shrink-0 tabular-nums text-muted-foreground">
                              {formatCurrency(r.revenue)}
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative shrink-0"
                aria-label={t("header.notifications")}
              >
                <Bell className="size-5" />
                {NOTIFICATION_KEYS.length - acknowledgedIds.size > 0 && (
                  <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                    {NOTIFICATION_KEYS.length - acknowledgedIds.size}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{t("header.notifications")}</p>
              </div>
              {NOTIFICATION_KEYS.map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  onSelect={(e) => {
                    e.preventDefault();
                    setAcknowledgedIds((prev) => new Set(prev).add(n.id));
                  }}
                  className={cn(
                    "flex flex-col items-start gap-0.5 py-3 cursor-default",
                    acknowledgedIds.has(n.id) && "bg-muted"
                  )}
                >
                  <span className="text-sm">
                    {t(n.titleKey, { store: CURRENT_STORE_NAME })}
                  </span>
                  <span className="text-xs text-muted-foreground">{t(n.timeKey)}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0 rounded-full">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                      U
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{t("header.userMenu.account")}</p>
                  <p className="text-xs text-muted-foreground">{t("header.userMenu.profile")}</p>
                </div>
                <DropdownMenuItem
                  onClick={() => navigate(`/${lang ?? "ja"}/manager`)}
                  className={location.pathname.endsWith("/manager") ? "bg-accent" : undefined}
                >
                  <LayoutGrid className="mr-2 size-4" />
                  {t("viewSwitcher.manager")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate(`/${lang ?? "ja"}/associate`)}
                  className={location.pathname.endsWith("/associate") ? "bg-accent" : undefined}
                >
                  <User className="mr-2 size-4" />
                  {t("viewSwitcher.associate")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 size-4" />
                  {t("login.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" className="shrink-0 gap-2" onClick={handleLogin}>
              <LogIn className="size-4" />
              {t("login.title")}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
