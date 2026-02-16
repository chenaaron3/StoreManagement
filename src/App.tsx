import { useEffect } from "react"
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useTranslation } from "react-i18next"
import { Layout } from "@/components/Layout"
import { ManagerPage } from "@/pages/ManagerPage"
import { AssociatePage } from "@/pages/AssociatePage"
import "./App.css"

function LangGuard({ children }: { children: React.ReactNode }) {
  const { lang } = useParams<{ lang: string }>()
  if (lang && !["en", "ja"].includes(lang)) {
    return <Navigate to="/ja/manager" replace />
  }
  return <>{children}</>
}

function AppContent() {
  const { i18n } = useTranslation()

  // Sync i18n language with URL path
  useEffect(() => {
    const path = window.location.pathname
    const match = path.match(/^\/(en|ja)(\/|$)/)
    if (match && match[1] !== i18n.language) {
      i18n.changeLanguage(match[1])
    }
  }, [i18n])

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/ja/manager" replace />} />
      <Route
        path="/:lang"
        element={
          <LangGuard>
            <Layout />
          </LangGuard>
        }
      >
        <Route index element={<Navigate to="manager" replace />} />
        <Route path="manager" element={<ManagerPage />} />
        <Route path="associate" element={<AssociatePage />} />
        <Route path="*" element={<Navigate to="manager" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/ja/manager" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  )
}

export default App
