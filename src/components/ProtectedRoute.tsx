import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { FullPageLoading } from './LoadingState'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return <FullPageLoading />
  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}
