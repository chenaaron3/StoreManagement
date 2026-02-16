import { Outlet } from "react-router-dom"

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="w-full">
        <Outlet />
      </div>
    </div>
  )
}
