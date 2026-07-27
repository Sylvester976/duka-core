import { cn } from '../../lib/cn'

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-warning/15 text-warning',
  processing: 'bg-warning/15 text-warning',
  paid: 'bg-success/15 text-success',
  failed: 'bg-danger/15 text-danger',
  expired: 'bg-surface-2 text-text-subtle',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  paid: 'Paid',
  failed: 'Failed',
  expired: 'Expired',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        STATUS_STYLES[status] ?? 'bg-surface-2 text-text-subtle',
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
