import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { Layout } from "@/components/Layout"
import { ManagerPage } from "@/pages/ManagerPage"
import { AssociatePage } from "@/pages/AssociatePage"
import "./App.css"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/manager" replace />} />
          <Route path="manager" element={<ManagerPage />} />
          <Route path="associate" element={<AssociatePage />} />
          <Route path="*" element={<Navigate to="/manager" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
