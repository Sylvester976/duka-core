import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { MoreVertical } from 'lucide-react'
import { cn } from '../../lib/cn'

const DropdownContext = createContext<{ close: () => void } | null>(null)

interface DropdownProps {
  trigger?: ReactNode
  align?: 'left' | 'right'
  children: ReactNode
}

export function Dropdown({ trigger, align = 'right', children }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        aria-label="Open actions menu"
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation()
          setOpen((value) => !value)
        }}
        className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius)] text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
      >
        {trigger ?? <MoreVertical className="h-4 w-4" />}
      </button>
      {open && (
        <div
          onClick={(event) => event.stopPropagation()}
          className={cn(
            'absolute top-full z-20 mt-1 min-w-36 rounded-[var(--radius)] border border-border bg-surface py-1 shadow-sm',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          <DropdownContext.Provider value={{ close: () => setOpen(false) }}>{children}</DropdownContext.Provider>
        </div>
      )}
    </div>
  )
}

interface DropdownItemProps {
  onClick: () => void
  variant?: 'default' | 'danger'
  children: ReactNode
}

export function DropdownItem({ onClick, variant = 'default', children }: DropdownItemProps) {
  const context = useContext(DropdownContext)

  return (
    <button
      type="button"
      onClick={() => {
        onClick()
        context?.close()
      }}
      className={cn(
        'block w-full px-3 py-1.5 text-left text-sm transition-colors hover:bg-surface-2',
        variant === 'danger' ? 'text-danger' : 'text-text',
      )}
    >
      {children}
    </button>
  )
}
