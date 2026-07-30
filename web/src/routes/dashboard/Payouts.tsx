import { useState } from 'react'
import { useDashboardPayouts } from '../../api/dashboard'
import { StatusBadge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { Pagination } from '../../components/ui/Pagination'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../components/ui/Table'
import { formatKES } from '../../lib/formatKES'

type SortColumn = 'gross_amount' | 'platform_fee' | 'net_amount' | 'status'
type SortState = { column: SortColumn; direction: 'asc' | 'desc' } | null

export function Payouts() {
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<SortState>(null)
  const { data: payoutsPage, isPending } = useDashboardPayouts({
    page,
    sort: sort?.column,
    direction: sort?.direction,
  })
  const payouts = payoutsPage?.data

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
      <h1 className="mb-6 font-semibold text-2xl">Payouts</h1>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell
                sortable
                sortDirection={sort?.column === 'gross_amount' ? sort.direction : null}
                onSort={() => toggleSort('gross_amount')}
              >
                Gross
              </TableHeaderCell>
              <TableHeaderCell
                sortable
                sortDirection={sort?.column === 'platform_fee' ? sort.direction : null}
                onSort={() => toggleSort('platform_fee')}
              >
                Platform fee
              </TableHeaderCell>
              <TableHeaderCell
                sortable
                sortDirection={sort?.column === 'net_amount' ? sort.direction : null}
                onSort={() => toggleSort('net_amount')}
              >
                Net
              </TableHeaderCell>
              <TableHeaderCell
                sortable
                sortDirection={sort?.column === 'status' ? sort.direction : null}
                onSort={() => toggleSort('status')}
              >
                Status
              </TableHeaderCell>
              <TableHeaderCell>M-Pesa ref</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payouts?.map((payout) => (
              <TableRow key={payout.id}>
                <TableCell className="tabular-nums">{formatKES(payout.gross_amount)}</TableCell>
                <TableCell className="tabular-nums text-text-muted">{formatKES(payout.platform_fee)}</TableCell>
                <TableCell className="tabular-nums font-medium">{formatKES(payout.net_amount)}</TableCell>
                <TableCell>
                  <StatusBadge status={payout.status} />
                </TableCell>
                <TableCell className="text-text-subtle">{payout.mpesa_b2c_txn_id ?? '—'}</TableCell>
              </TableRow>
            ))}
            {!isPending && payouts?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                  No payouts yet.
                </td>
              </tr>
            )}
          </TableBody>
        </Table>
        {payoutsPage && (
          <Pagination currentPage={payoutsPage.current_page} lastPage={payoutsPage.last_page} onPageChange={setPage} />
        )}
      </Card>
    </div>
  )
}
