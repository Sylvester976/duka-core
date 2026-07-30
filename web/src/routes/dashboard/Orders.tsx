import { useState } from 'react'
import { useDashboardOrders } from '../../api/dashboard'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Pagination } from '../../components/ui/Pagination'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../components/ui/Table'
import { cn } from '../../lib/cn'
import { formatKES } from '../../lib/formatKES'
import { OrderDetailPanel } from './OrderDetailPanel'

const STATUS_FILTERS = ['all', 'pending', 'paid', 'failed', 'expired'] as const

type SortColumn = 'amount' | 'status' | 'created_at'
type SortState = { column: SortColumn; direction: 'asc' | 'desc' } | null

export function Orders() {
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>('all')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<SortState>(null)
  const { data: ordersPage, isPending } = useDashboardOrders({
    status: filter === 'all' ? undefined : filter,
    page,
    sort: sort?.column,
    direction: sort?.direction,
  })
  const orders = ordersPage?.data
  const [selectedId, setSelectedId] = useState<string | null>(null)

  function toggleSort(column: SortColumn) {
    setPage(1)
    setSort((current) => {
      if (current?.column !== column) return { column, direction: 'asc' }
      if (current.direction === 'asc') return { column, direction: 'desc' }
      return null
    })
  }

  return (
    <div>
      <h1 className="mb-4 font-semibold text-2xl">Orders</h1>

      <div className="mb-4 flex gap-2">
        {STATUS_FILTERS.map((status) => (
          <Button
            key={status}
            type="button"
            variant={filter === status ? 'primary' : 'ghost'}
            onClick={() => {
              setFilter(status)
              setPage(1)
            }}
            className={cn('min-h-9 px-3 py-1 text-sm capitalize', filter !== status && 'hover:text-text')}
          >
            {status}
          </Button>
        ))}
      </div>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Customer</TableHeaderCell>
              <TableHeaderCell
                sortable
                sortDirection={sort?.column === 'amount' ? sort.direction : null}
                onSort={() => toggleSort('amount')}
              >
                Amount
              </TableHeaderCell>
              <TableHeaderCell
                sortable
                sortDirection={sort?.column === 'status' ? sort.direction : null}
                onSort={() => toggleSort('status')}
              >
                Status
              </TableHeaderCell>
              <TableHeaderCell
                sortable
                sortDirection={sort?.column === 'created_at' ? sort.direction : null}
                onSort={() => toggleSort('created_at')}
              >
                Date
              </TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders?.map((order) => (
              <TableRow
                key={order.id}
                onClick={() => setSelectedId(order.id)}
                className="cursor-pointer hover:bg-surface-2"
              >
                <TableCell>{order.customer_msisdn}</TableCell>
                <TableCell className="tabular-nums">{formatKES(order.amount)}</TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-text-muted">{new Date(order.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {!isPending && orders?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-text-muted">
                  No orders yet.
                </td>
              </tr>
            )}
          </TableBody>
        </Table>
        {ordersPage && (
          <Pagination currentPage={ordersPage.current_page} lastPage={ordersPage.last_page} onPageChange={setPage} />
        )}
      </Card>

      <OrderDetailPanel orderId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  )
}
