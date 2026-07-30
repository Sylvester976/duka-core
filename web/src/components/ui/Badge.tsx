import { cn } from '../../lib/cn'

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  processing: 'bg-warning/10 text-warning',
  paid: 'bg-success/10 text-success',
  failed: 'bg-danger/10 text-danger',
  expired: 'bg-surface-2 text-text-subtle',
  active: 'bg-success/10 text-success',
  suspended: 'bg-danger/10 text-danger',
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
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide',
        STATUS_STYLES[status] ?? 'bg-surface-2 text-text-subtle',
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
