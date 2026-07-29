import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react'
import { Card } from './Card'
import { cn } from '../../lib/cn'

interface StatCardDelta {
  value: string
  direction: 'up' | 'down' | 'flat'
}

interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  delta?: StatCardDelta
  loading?: boolean
}

export function StatCard({ label, value, icon: Icon, delta, loading }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <p className="text-xs text-text-muted">{label}</p>
        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius)] bg-surface-2 text-text-muted">
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className={cn('mt-1 text-2xl font-semibold tabular-nums', loading && 'animate-pulse text-text-subtle')}>
        {value}
      </p>
      {delta && !loading && (
        <p
          className={cn(
            'mt-1 inline-flex items-center gap-1 text-xs font-medium',
            delta.direction === 'up' && 'text-success',
            delta.direction === 'down' && 'text-danger',
            delta.direction === 'flat' && 'text-text-subtle',
          )}
        >
          {delta.direction === 'up' && <TrendingUp className="h-3 w-3" />}
          {delta.direction === 'down' && <TrendingDown className="h-3 w-3" />}
          {delta.value}
        </p>
      )}
    </Card>
  )
}
