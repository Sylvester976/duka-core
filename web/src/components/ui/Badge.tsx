import { cn } from '../../lib/cn'

const STATUS_STYLES: Record<string, string> = {
  pending: 'text-warning',
  processing: 'text-warning',
  paid: 'text-success',
  failed: 'text-danger',
  expired: 'text-text-subtle',
  active: 'text-success',
  suspended: 'text-danger',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  paid: 'Paid',
  failed: 'Failed',
  expired: 'Expired',
  active: 'Active',
  suspended: 'Suspended',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[var(--radius)] border border-current/25 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide',
        STATUS_STYLES[status] ?? 'text-text-subtle',
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
