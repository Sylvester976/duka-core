import { usePlatformOverview } from '../../api/platform'
import { Card } from '../../components/ui/Card'
import { cn } from '../../lib/cn'
import { formatKES } from '../../lib/formatKES'

export function PlatformOverview() {
  const { data: overview, isPending } = usePlatformOverview()

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl">Platform overview</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Tenants" value={overview ? String(overview.tenants_total) : '—'} loading={isPending} />
        <StatCard
          label="Active / suspended"
          value={overview ? `${overview.tenants_active} / ${overview.tenants_suspended}` : '—'}
          loading={isPending}
        />
        <StatCard
          label="Platform earnings (all-time)"
          value={overview ? formatKES(overview.platform_earnings_total) : '—'}
          loading={isPending}
        />
        <StatCard
          label="Pending payouts"
          value={overview ? String(overview.pending_payouts) : '—'}
          loading={isPending}
        />
      </div>
    </div>
  )
}

function StatCard({ label, value, loading }: { label: string; value: string; loading: boolean }) {
  return (
    <Card>
      <p className="text-xs text-text-muted">{label}</p>
      <p className={cn('mt-1 text-2xl font-semibold tabular-nums', loading && 'animate-pulse text-text-subtle')}>
        {value}
      </p>
    </Card>
  )
}
