import { useState } from 'react'
import { useDashboardOrders } from '../../api/dashboard'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { cn } from '../../lib/cn'
import { formatKES } from '../../lib/formatKES'
import { OrderDetailPanel } from './OrderDetailPanel'

const STATUS_FILTERS = ['all', 'pending', 'paid', 'failed', 'expired'] as const

export function Orders() {
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>('all')
  const { data: orders, isPending } = useDashboardOrders(filter === 'all' ? undefined : filter)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <div>
      <h1 className="mb-4 font-serif text-2xl">Orders</h1>

      <div className="mb-4 flex gap-2">
        {STATUS_FILTERS.map((status) => (
          <Button
            key={status}
            type="button"
            variant={filter === status ? 'primary' : 'ghost'}
            onClick={() => setFilter(status)}
            className={cn('min-h-9 px-3 py-1 text-sm capitalize', filter !== status && 'hover:text-text')}
          >
            {status}
          </Button>
        ))}
      </div>

      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-subtle">
              <th className="px-4 py-2 font-medium">Customer</th>
              <th className="px-4 py-2 font-medium">Amount</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order) => (
              <tr
                key={order.id}
                onClick={() => setSelectedId(order.id)}
                className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-2"
              >
                <td className="px-4 py-2.5">{order.customer_msisdn}</td>
                <td className="px-4 py-2.5 tabular-nums">{formatKES(order.amount)}</td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-4 py-2.5 text-text-muted">{new Date(order.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {!isPending && orders?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-text-muted">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <OrderDetailPanel orderId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  )
}
