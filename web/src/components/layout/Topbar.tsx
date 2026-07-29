import { Search } from 'lucide-react'
import { useLocation } from 'react-router'
import { Dropdown, DropdownItem } from '../ui/Dropdown'
import { findActiveNavItem, type NavGroup } from './nav'

interface TopbarProps {
  rootLabel: string
  groups: NavGroup[]
  userName?: string
  userEmail?: string
  onLogout: () => void
}

export function Topbar({ rootLabel, groups, userName, userEmail, onLogout }: TopbarProps) {
  const location = useLocation()
  const activeItem = findActiveNavItem(location.pathname, groups)

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-8">
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <span>{rootLabel}</span>
        {activeItem && (
          <>
            <span className="text-text-subtle">/</span>
            <span className="font-medium text-text">{activeItem.label}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex items-center gap-2 rounded-[var(--radius)] border border-border px-3 py-1.5 text-sm text-text-muted transition-colors hover:border-text-subtle"
        >
          <Search className="h-4 w-4" />
          <span>Search</span>
          <span className="ml-1 rounded-[var(--radius)] border border-border px-1.5 py-0.5 text-[10px] text-text-subtle">
            ⌘K
          </span>
        </button>
        <Dropdown
          align="right"
          trigger={
            <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius)] bg-surface-2 text-xs font-medium uppercase text-text-muted">
              {userName?.[0] ?? '?'}
            </span>
          }
        >
          <div className="border-b border-border px-3 py-2">
            <p className="truncate text-sm font-medium text-text">{userName}</p>
            <p className="truncate text-xs text-text-muted">{userEmail}</p>
          </div>
          <DropdownItem onClick={onLogout} variant="danger">
            Log out
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  )
}
