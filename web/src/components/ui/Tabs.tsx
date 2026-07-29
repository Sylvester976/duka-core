import { createContext, useContext, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

const TabsContext = createContext<{ value: string; onChange: (value: string) => void } | null>(null)

function useTabsContext() {
  const context = useContext(TabsContext)
  if (!context) throw new Error('Tab/TabList/TabPanel must be used within Tabs')
  return context
}

interface TabsProps {
  value: string
  onChange: (value: string) => void
  children: ReactNode
}

export function Tabs({ value, onChange, children }: TabsProps) {
  return <TabsContext.Provider value={{ value, onChange }}>{children}</TabsContext.Provider>
}

export function TabList({ children }: { children: ReactNode }) {
  return <div className="flex gap-4 border-b border-border">{children}</div>
}

export function Tab({ value, children }: { value: string; children: ReactNode }) {
  const { value: active, onChange } = useTabsContext()
  const isActive = active === value

  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={cn(
        '-mb-px border-b-2 px-1 pb-2 text-sm font-medium transition-colors',
        isActive ? 'border-brand text-text' : 'border-transparent text-text-muted hover:text-text',
      )}
    >
      {children}
    </button>
  )
}

export function TabPanel({ value, children }: { value: string; children: ReactNode }) {
  const { value: active } = useTabsContext()
  if (active !== value) return null
  return <div className="pt-4">{children}</div>
}
