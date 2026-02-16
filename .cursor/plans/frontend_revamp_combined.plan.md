---
name: Frontend Revamp (Combined)
overview: "Complete frontend revamp for Store Management: Nifty-inspired theme, shadcn Sidebar adoption, layout restructure, whitespace standardization, shared components, and chart palette—all views unified."
todos: []
isProject: false
---

# Frontend Revamp Plan: Nifty Theme + Shadcn

## Current State Summary

**Tech stack:** React 19, Tailwind 4, shadcn/ui, Recharts, Vite.

**Shadcn setup:** [components.json](components.json) – `style: "new-york"`, `baseColor: "neutral"`, `cssVariables: true`, `tailwind.config: ""`. Custom [ManagerSidebar](src/components/ManagerSidebar.tsx) (not shadcn Sidebar).

**Structure:** Manager (tabbed + sidebar), Associate (single page, no sidebar). Shared Layout, Header, ViewSwitcher.

**Issues:** Sidebar floating (`rounded-br-2xl`, `shadow-lg`); whitespace inconsistency; Manager vs Associate feel like different apps; charts mix hardcoded hex and single colors; duplicated utilities.

---

## 1. Nifty Color Palette (Target)


| Role           | Color                                     | Notes                         |
| -------------- | ----------------------------------------- | ----------------------------- |
| Sidebar bg     | `#1a2030` / `#232A3B`                     | Dark navy/charcoal            |
| Sidebar active | `#5B9BD5`                                 | Blue accent                   |
| Primary accent | `#5B9BD5`                                 | Buttons, links, active states |
| Content bg     | `#F5F6FA`                                 | Light gray                    |
| Cards          | White                                     | Clean panels                  |
| Chart palette  | Blue, green, orange, purple, red + 3 more | `--chart-1` … `--chart-8`     |
| Success        | `#27ae60`                                 | Green                         |
| Warning        | `#f39c12`                                 | Amber                         |
| Danger         | `#e74c3c`                                 | Red                           |


---

## 2. Theme Variables and Shadcn Config

### 2.1 [src/index.css](src/index.css)

**Light mode:**

- `--background`: `#F5F6FA`; `--card`, `--popover`: white
- `--primary`: `#5B9BD5` (Nifty blue)
- `--chart-1` … `--chart-5`: Nifty palette; add `--chart-6`, `--chart-7`, `--chart-8`
- `--success`, `--success-foreground`; `--warning`, `--warning-foreground`
- `--destructive-foreground`: add if missing
- `--sidebar-*`: dark values for Nifty sidebar (see 2.3)

**@theme inline:** Add `--color-chart-6/7/8`, `--color-success`, `--color-warning`, `--color-destructive-foreground`.

### 2.2 [components.json](components.json)

Add (when adopting Sidebar):

```json
"menuColor": "inverted",
"menuAccent": "bold"
```

### 2.3 Dark sidebar CSS (for shadcn Sidebar)

Use class or `data-sidebar="dark"`:

```css
.sidebar-dark {
  --sidebar: 220 20% 14%;           /* #232A3B */
  --sidebar-foreground: 220 10% 98%;
  --sidebar-primary: 210 70% 55%;   /* #5B9BD5 */
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 220 15% 22%;
  --sidebar-accent-foreground: 0 0% 98%;
  --sidebar-border: 220 10% 20%;
}
```

Check installed Sidebar component for exact var names (HSL vs oklch).

---

## 3. Shadcn Sidebar + Layout Restructure

### 3.1 Add shadcn Sidebar

Run `npx shadcn@latest add sidebar`. Use:

- `SidebarProvider`, `Sidebar`, `SidebarInset`
- `variant="inset"` for integrated look (no floating)
- `collapsible="icon"` (matches current)
- `SidebarProvider` wraps Layout body

### 3.2 Layout structure

```
div.flex.flex-col.min-h-screen.bg-background
  Header (full width, sticky)
  SidebarProvider
    div.flex.flex-1.min-h-0 (no container)
      AppSidebar (shadcn Sidebar + dark class)  ← route-aware nav
      SidebarInset
        main.flex-1.overflow-auto.p-6
          Outlet (Manager or Associate)
```

- **AppSidebar** uses shadcn Sidebar primitives; renders Manager nav or Associate nav based on route.
- Remove Layout `container`; padding in main (`p-6`).
- No `rounded-br-*`, no `shadow-lg` on sidebar.

### 3.3 Header

White header, subtle shadow/border; ViewSwitcher active state uses primary blue.

---

## 4. Whitespace Standardization

- **Page padding:** `p-6` everywhere.
- **Section gap:** `space-y-6` or `space-y-8` (pick one).
- **Layout main:** Remove `container`; no `py-8` wrapper.
- **Associate:** Remove `max-w-5xl` for full-width; reduce Separators (use spacing).
- **Customer modal:** Reduce 6 Separators to 1–2; use `space-y-5` or `space-y-6`.

---

## 5. Unified Theme (Manager + Associate)

- Both use AppSidebar (Manager: full nav; Associate: simplified).
- Same content treatment: light bg, white cards, `p-6`, same typography.
- Page titles: `text-2xl font-semibold`; section titles: `text-sm font-medium text-muted-foreground`.

---

## 6. Shared Elements and Cleanup

### 6.1 Extract shared


| Pattern                      | Action                                                                                              |
| ---------------------------- | --------------------------------------------------------------------------------------------------- |
| Page header                  | `PageHeader({ title, subtitle })`                                                                   |
| Section                      | Extend [Section](src/components/customer-detail/Section.tsx) for Associate; optional `spaceY`, `as` |
| RANK_ORDER / topRanking      | Move to `@/lib/rankingBadge` or `memberUtils`                                                       |
| formatCurrency, formatNumber | Move to `@/lib/utils`                                                                               |


### 6.2 Remove redundant

- Manager: change nested `main` to `div`; merge inner `div.space-y-8.p-6` into content wrapper.
- Layout: remove `container`.
- App.css: remove import and delete if empty.

---

## 7. Manager View

- ManagerPage renders only tab content (no sidebar).
- Use `PageHeader`, `p-6`, `space-y-6` or `space-y-8`.
- KPI cards: white, optional accent; tab buttons: primary when active.
- Tables: striped rows, darker header.

---

## 8. Associate View

- Same main area as Manager.
- Use `Section` for Search, In store, Tasks.
- Member cards: white, hover; segment badges with theme palette.
- AssociateTodoList: match Manager card/button styling.

---

## 9. Charts – All Colored


| Chart                        | File                                                                                        | Change                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------- |
| TrendChart                   | [TrendChart.tsx](src/components/TrendChart.tsx)                                             | `var(--primary)` or `var(--chart-1)`     |
| DayOfWeekChart               | [DayOfWeekChart.tsx](src/components/DayOfWeekChart.tsx)                                     | `var(--chart-1)` or multi-color via Cell |
| MultiSeriesTrendChart        | [MultiSeriesTrendChart.tsx](src/components/MultiSeriesTrendChart.tsx)                       | `var(--chart-1)` … `var(--chart-8)`      |
| CategoryTrendChart           | [CategoryTrendChart.tsx](src/components/customer-detail/CategoryTrendChart.tsx)             | Inherits from theme                      |
| AdvancedCustomerSegmentation | [AdvancedCustomerSegmentation.tsx](src/components/manager/AdvancedCustomerSegmentation.tsx) | Theme vars for Pie + Bar                 |
| EmployeesTab BarChart        | [EmployeesTab.tsx](src/components/manager/EmployeesTab.tsx)                                 | `var(--chart-1)` or per-bar Cell         |


---

## 10. Component Polish

- Buttons: primary blue; secondary light gray.
- Badges: success/warning/danger from theme.
- Inputs: white bg, focus ring primary.
- Dialog: white, shadow, border.

---

## 11. Implementation Order

1. **Shared utilities** – formatCurrency, formatNumber → `@/lib/utils`; topRanking, RANK_ORDER → `@/lib/rankingBadge`.
2. **Theme variables** – Update index.css: Nifty palette, chart-6–8, success/warning, destructive-foreground, dark sidebar vars, @theme inline.
3. **shadcn Sidebar** – `npx shadcn@latest add sidebar`; add menuColor/menuAccent to components.json.
4. **Layout + AppSidebar** – Restructure Layout with SidebarProvider, SidebarInset; build AppSidebar from shadcn primitives; remove container.
5. **Shared components** – PageHeader; extend Section for Associate.
6. **Manager/Associate pages** – Remove redundant divs; use PageHeader, Section; standardize padding and Separators.
7. **Charts** – Update all to use theme vars.
8. **Polish** – KPI cards, tables, buttons, badges; remove App.css if unused.

---

## 12. Files to Modify

**Config & theme:** [components.json](components.json), [src/index.css](src/index.css)

**Layout:** [src/components/Layout.tsx](src/components/Layout.tsx), [src/components/AppSidebar.tsx](src/components/AppSidebar.tsx) (new), [src/components/ManagerSidebar.tsx](src/components/ManagerSidebar.tsx) (refactor into AppSidebar), [src/components/Header.tsx](src/components/Header.tsx)

**Shared:** [src/lib/utils.ts](src/lib/utils.ts), [src/lib/rankingBadge.ts](src/lib/rankingBadge.ts), [src/components/PageHeader.tsx](src/components/PageHeader.tsx) (new), [src/components/customer-detail/Section.tsx](src/components/customer-detail/Section.tsx)

**Pages:** [src/pages/ManagerPage.tsx](src/pages/ManagerPage.tsx), [src/pages/AssociatePage.tsx](src/pages/AssociatePage.tsx)

**Charts:** [TrendChart.tsx](src/components/TrendChart.tsx), [DayOfWeekChart.tsx](src/components/DayOfWeekChart.tsx), [MultiSeriesTrendChart.tsx](src/components/MultiSeriesTrendChart.tsx), [CategoryTrendChart.tsx](src/components/customer-detail/CategoryTrendChart.tsx), [AdvancedCustomerSegmentation.tsx](src/components/manager/AdvancedCustomerSegmentation.tsx), [EmployeesTab.tsx](src/components/manager/EmployeesTab.tsx)

**Components:** [KPICard.tsx](src/components/KPICard.tsx), [MemberCard.tsx](src/components/MemberCard.tsx), [MemberCardContent.tsx](src/components/MemberCardContent.tsx), [CustomerDetailModalContent.tsx](src/components/CustomerDetailModalContent.tsx)

**Cleanup:** [src/App.tsx](src/App.tsx), [src/App.css](src/App.css)

---

## 13. Optional (Out of Scope)

- Dark mode toggle.
- Dashboard-style widget layout for Associate.
- Progress bars or sparklines for KPIs.

