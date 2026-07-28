import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  containerClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, containerClassName, label, id, error, ...props }, ref) => (
    <div className={cn('mb-4', containerClassName)}>
      <label className="mb-1 block text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        className={cn(
          'w-full rounded-[var(--radius)] border border-border bg-transparent px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand disabled:cursor-not-allowed disabled:opacity-60',
          error && 'border-danger',
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  ),
)
Input.displayName = 'Input'
