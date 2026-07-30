import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type SheetSide = 'right' | 'bottom' | 'center'

interface SheetProps {
  open: boolean
  onClose: () => void
  side?: SheetSide
  title?: string
  closeDisabled?: boolean
  children: ReactNode
  className?: string
}

const WRAPPER_CLASSES: Record<SheetSide, string> = {
  right: 'justify-end',
  bottom: 'items-end',
  center: 'items-end sm:items-center sm:justify-center',
}

const PANEL_CLASSES: Record<SheetSide, string> = {
  right: 'h-full w-full max-w-sm overflow-y-auto',
  bottom: 'max-h-[80dvh] w-full overflow-y-auto rounded-t-[var(--radius-lg)]',
  center: 'w-full max-w-[440px] overflow-y-auto rounded-t-[var(--radius-lg)] sm:rounded-[var(--radius-lg)]',
}

export function Sheet({ open, onClose, side = 'right', title, closeDisabled, children, className }: SheetProps) {
  if (!open) return null

  return (
    <div className={cn('fixed inset-0 z-30 flex', WRAPPER_CLASSES[side])}>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        disabled={closeDisabled}
        className="absolute inset-0 bg-black/40 disabled:cursor-not-allowed"
      />
      <div className={cn('relative z-10 flex flex-col bg-surface p-5 shadow-lg', PANEL_CLASSES[side], className)}>
        {side === 'bottom' && <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />}
        {title && <h2 className="mb-4 text-lg font-semibold">{title}</h2>}
        {children}
      </div>
    </div>
  )
}
