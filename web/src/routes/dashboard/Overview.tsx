import { useDashboardOrders, useOverview } from '../../api/dashboard'
import { StatusBadge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { cn } from '../../lib/cn'
import { formatKES } from '../../lib/formatKES'

export function Overview() {
  const { data: overview, isPending } = useOverview()
  const { data: orders } = useDashboardOrders()

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl">Overview</h1>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Today's revenue" value={overview ? formatKES(overview.today_revenue) : '—'} loading={isPending} />
        <StatCard label="Orders today" value={overview ? String(overview.orders_today) : '—'} loading={isPending} />
        <StatCard label="Pending payouts" value={overview ? String(overview.pending_payouts) : '—'} loading={isPending} />
        <StatCard label="Net after fee" value={overview ? formatKES(overview.net_today) : '—'} loading={isPending} />
      </div>

      <h2 className="mb-3 text-sm font-semibold text-text-muted">Recent orders</h2>
      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-subtle">
              <th className="px-4 py-2 font-medium">Customer</th>
              <th className="px-4 py-2 font-medium">Amount</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders?.slice(0, 8).map((order) => (
              <tr key={order.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5">{order.customer_msisdn}</td>
                <td className="px-4 py-2.5 tabular-nums">{formatKES(order.amount)}</td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={order.status} />
                </td>
              </tr>
            ))}
            {orders?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-text-muted">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
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
