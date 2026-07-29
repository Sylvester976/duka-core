import { Building2, LayoutDashboard } from 'lucide-react'
import { Outlet } from 'react-router'
import { Sidebar } from '../../components/layout/Sidebar'
import { Topbar } from '../../components/layout/Topbar'
import type { NavGroup } from '../../components/layout/nav'
import { useAuth } from '../../lib/auth'

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { to: '/platform', label: 'Overview', end: true, icon: LayoutDashboard },
      { to: '/platform/tenants', label: 'Tenants', icon: Building2 },
    ],
  },
]

export function PlatformLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-dvh text-text">
      <Sidebar groups={NAV_GROUPS} />
      <div className="flex flex-1 flex-col">
        <Topbar
          rootLabel="Platform admin"
          groups={NAV_GROUPS}
          userName={user?.name}
          userEmail={user?.email}
          onLogout={logout}
        />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
