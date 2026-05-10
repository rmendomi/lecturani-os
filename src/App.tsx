import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { HomePage } from '@/pages/HomePage'
import { ChildrenPage } from '@/pages/ChildrenPage'
import { CreateChildPage } from '@/pages/CreateChildPage'
import { CreateStoryPage } from '@/pages/CreateStoryPage'
import { ReadingPage } from '@/pages/ReadingPage'
import { LibraryPage } from '@/pages/LibraryPage'
import { ProgressPage } from '@/pages/ProgressPage'
import { SettingsPage } from '@/pages/SettingsPage'

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/ninos" element={<ProtectedRoute><ChildrenPage /></ProtectedRoute>} />
            <Route path="/ninos/nuevo" element={<ProtectedRoute><CreateChildPage /></ProtectedRoute>} />
            <Route path="/ninos/:id" element={<ProtectedRoute><CreateChildPage /></ProtectedRoute>} />
            <Route path="/crear" element={<ProtectedRoute><CreateStoryPage /></ProtectedRoute>} />
            <Route path="/leer/:id" element={<ProtectedRoute><ReadingPage /></ProtectedRoute>} />
            <Route path="/biblioteca" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
            <Route path="/progreso" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
            <Route path="/ajustes" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  )
}
