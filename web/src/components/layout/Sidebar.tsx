import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { NavLink } from 'react-router'
import { cn } from '../../lib/cn'
import type { NavGroup } from './nav'

export function Sidebar({ groups }: { groups: NavGroup[] }) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-surface p-6">
      <p className="mb-8 font-semibold text-lg">duka-core</p>
      <nav className="flex flex-1 flex-col gap-5">
        {groups.map((group, index) => (
          <NavGroupSection key={group.label ?? index} group={group} />
        ))}
      </nav>
    </aside>
  )
}

function NavGroupSection({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="flex flex-col gap-1">
      {group.label && (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex items-center justify-between px-3 pb-1 text-[11px] font-medium uppercase tracking-wide text-text-subtle transition-colors hover:text-text-muted"
        >
          {group.label}
          <ChevronDown className={cn('h-3 w-3 transition-transform', !open && '-rotate-90')} />
        </button>
      )}
      {open &&
        group.items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-[var(--radius)] px-3 py-2 text-xs font-medium uppercase tracking-wide text-text-muted transition-colors hover:text-text',
                isActive && 'bg-surface-2 text-text',
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
    </div>
  )
}
