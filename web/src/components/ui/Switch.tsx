import { cn } from '../../lib/cn'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  'aria-label': string
  disabled?: boolean
}

export function Switch({ checked, onChange, disabled, ...props }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-[var(--radius)] border border-border transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        checked ? 'bg-brand' : 'bg-surface-2',
      )}
      {...props}
    >
      <span
        className={cn(
          'inline-block h-3.5 w-3.5 rounded-[1px] bg-bg transition-transform',
          checked ? 'translate-x-4' : 'translate-x-1',
        )}
      />
    </button>
  )
}
