import { Banknote, Building2, Clock, Users } from 'lucide-react'
import { usePlatformOverview } from '../../api/platform'
import { StatCard } from '../../components/ui/StatCard'
import { formatKES } from '../../lib/formatKES'

export function PlatformOverview() {
  const { data: overview, isPending } = usePlatformOverview()

  return (
    <div>
      <h1 className="mb-6 font-semibold text-2xl">Platform overview</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Tenants"
          value={overview ? String(overview.tenants_total) : '—'}
          icon={Building2}
          loading={isPending}
        />
        <StatCard
          label="Active / suspended"
          value={overview ? `${overview.tenants_active} / ${overview.tenants_suspended}` : '—'}
          icon={Users}
          loading={isPending}
        />
        <StatCard
          label="Platform earnings (all-time)"
          value={overview ? formatKES(overview.platform_earnings_total) : '—'}
          icon={Banknote}
          loading={isPending}
        />
        <StatCard
          label="Pending payouts"
          value={overview ? String(overview.pending_payouts) : '—'}
          icon={Clock}
          loading={isPending}
        />
      </div>
    </div>
  )
}
