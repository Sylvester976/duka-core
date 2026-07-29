import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn('w-full text-sm', className)} {...props} />
}

export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('border-b border-border text-left text-text-subtle', className)} {...props} />
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={className} {...props} />
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('border-b border-border last:border-0', className)} {...props} />
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-2.5', className)} {...props} />
}

interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean
  sortDirection?: 'asc' | 'desc' | null
  onSort?: () => void
}

export function TableHeaderCell({
  className,
  sortable,
  sortDirection,
  onSort,
  children,
  ...props
}: TableHeaderCellProps) {
  if (!sortable) {
    return (
      <th className={cn('px-4 py-2 font-medium', className)} {...props}>
        {children}
      </th>
    )
  }

  const Icon = sortDirection === 'asc' ? ArrowUp : sortDirection === 'desc' ? ArrowDown : ChevronsUpDown

  return (
    <th className={cn('px-4 py-2 font-medium', className)} {...props}>
      <button
        type="button"
        onClick={onSort}
        className="inline-flex items-center gap-1 text-text-subtle transition-colors hover:text-text"
      >
        {children}
        <Icon className="h-3 w-3" />
      </button>
    </th>
  )
}
