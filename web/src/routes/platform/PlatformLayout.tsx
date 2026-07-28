import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { useAuth } from '../../lib/auth'

const NAV_ITEMS = [
  { to: '/platform', label: 'Overview', end: true },
  { to: '/platform/tenants', label: 'Tenants', end: false },
]

export function PlatformLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-dvh bg-bg text-text">
      <aside className="flex w-56 shrink-0 flex-col border-r border-border p-4">
        <p className="mb-1 truncate text-sm font-semibold">{user?.name}</p>
        <p className="mb-6 text-xs text-text-subtle">Platform admin</p>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'rounded-[var(--radius)] px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:text-text',
                  isActive && 'bg-surface-2 text-text',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => logout()}
          className="rounded-[var(--radius)] px-3 py-2 text-left text-sm text-text-muted hover:text-text"
        >
          Log out
        </button>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
