import { Outlet } from "react-router-dom"
import { Separator } from "@/components/ui/separator"
import { Header } from "./Header"

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Separator />
      <main className="container py-8">
        <Outlet />
      </main>
    </div>
  )
}
