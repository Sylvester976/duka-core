import { LayoutDashboard, Package, Settings, ShoppingCart, Wallet } from 'lucide-react'
import { Outlet } from 'react-router'
import { Sidebar } from '../../components/layout/Sidebar'
import { Topbar } from '../../components/layout/Topbar'
import type { NavGroup } from '../../components/layout/nav'
import { useAuth } from '../../lib/auth'

const NAV_GROUPS: NavGroup[] = [
  { items: [{ to: '/dashboard', label: 'Overview', end: true, icon: LayoutDashboard }] },
  {
    label: 'Commerce',
    items: [
      { to: '/dashboard/products', label: 'Products', icon: Package },
      { to: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
    ],
  },
  {
    items: [
      { to: '/dashboard/payouts', label: 'Payouts', icon: Wallet },
      { to: '/dashboard/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export function DashboardLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-dvh text-text">
      <Sidebar groups={NAV_GROUPS} />
      <div className="flex flex-1 flex-col">
        <Topbar rootLabel="Dashboard" groups={NAV_GROUPS} userName={user?.name} userEmail={user?.email} onLogout={logout} />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
