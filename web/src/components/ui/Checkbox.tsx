import { Check } from 'lucide-react'
import { cn } from '../../lib/cn'

interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  'aria-label': string
  disabled?: boolean
}

export function Checkbox({ checked, onChange, disabled, ...props }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[var(--radius)] border border-border transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        checked ? 'bg-brand border-brand text-brand-contrast' : 'bg-surface text-transparent',
      )}
      {...props}
    >
      <Check className="h-3 w-3" strokeWidth={3} />
    </button>
  )
}
