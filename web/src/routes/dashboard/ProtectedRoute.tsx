import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../../lib/auth'

export function ProtectedRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="flex min-h-dvh items-center justify-center text-text-muted">Loading…</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
