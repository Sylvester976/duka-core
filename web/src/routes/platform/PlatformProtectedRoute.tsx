import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../lib/auth'

export function PlatformProtectedRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="flex min-h-dvh items-center justify-center text-text-muted">Loading…</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'platform_admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
