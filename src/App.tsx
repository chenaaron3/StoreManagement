import './App.css';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';

import { Layout } from '@/components/Layout';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AssociatePage } from '@/pages/AssociatePage';
import { LoginPage } from '@/pages/LoginPage';
import { ManagerPage } from '@/pages/ManagerPage';

function LangGuard({ children }: { children: React.ReactNode }) {
  const { lang } = useParams<{ lang: string }>()
  if (lang && !["en", "ja"].includes(lang)) {
    return <Navigate to="/ja/manager" replace />
  }
  return <>{children}</>
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const { lang } = useParams<{ lang: string }>()
  const { pathname } = useLocation()
  const isLoginPage = pathname.endsWith("/login")
  if (!isAuthenticated && !isLoginPage) {
    return <Navigate to={`/${lang ?? "ja"}/login`} replace />
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
    <AuthProvider>
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
          <Route
            path="login"
            element={<LoginPage />}
          />
          <Route
            path="manager"
            element={
              <AuthGuard>
                <ManagerPage />
              </AuthGuard>
            }
          />
          <Route
            path="associate"
            element={
              <AuthGuard>
                <AssociatePage />
              </AuthGuard>
            }
          />
          <Route path="*" element={<Navigate to="manager" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/ja/manager" replace />} />
      </Routes>
    </AuthProvider>
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
