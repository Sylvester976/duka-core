import { useState } from 'react'
import { usePlatformTenants } from '../../api/platform'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Pagination } from '../../components/ui/Pagination'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../components/ui/Table'
import { formatKES } from '../../lib/formatKES'
import { TenantDetailPanel } from './TenantDetailPanel'
import { TenantFormPanel } from './TenantFormPanel'

type SortColumn = 'name' | 'orders_count'
type SortState = { column: SortColumn; direction: 'asc' | 'desc' } | null

export function Tenants() {
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<SortState>(null)
  const { data: tenantsPage, isPending } = usePlatformTenants({
    page,
    sort: sort?.column,
    direction: sort?.direction,
  })
  const tenants = tenantsPage?.data
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)

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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl">Tenants</h1>
        <Button type="button" onClick={() => setFormOpen(true)}>
          New tenant
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell
                sortable
                sortDirection={sort?.column === 'name' ? sort.direction : null}
                onSort={() => toggleSort('name')}
              >
                Business
              </TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell
                sortable
                sortDirection={sort?.column === 'orders_count' ? sort.direction : null}
                onSort={() => toggleSort('orders_count')}
              >
                Orders
              </TableHeaderCell>
              <TableHeaderCell>Net remitted</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenants?.map((tenant) => (
              <TableRow
                key={tenant.id}
                onClick={() => setSelectedId(tenant.id)}
                className="cursor-pointer hover:bg-surface-2"
              >
                <TableCell>
                  <p>{tenant.name}</p>
                  <p className="text-xs text-text-subtle">{tenant.slug}</p>
                </TableCell>
                <TableCell>
                  <StatusBadge status={tenant.status} />
                </TableCell>
                <TableCell className="tabular-nums">{tenant.orders_count}</TableCell>
                <TableCell className="tabular-nums">
                  {tenant.net_remitted ? formatKES(tenant.net_remitted) : '—'}
                </TableCell>
              </TableRow>
            ))}
            {!isPending && tenants?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-text-muted">
                  No tenants yet.
                </td>
              </tr>
            )}
          </TableBody>
        </Table>
        {tenantsPage && (
          <Pagination currentPage={tenantsPage.current_page} lastPage={tenantsPage.last_page} onPageChange={setPage} />
        )}
      </Card>

      <TenantDetailPanel tenantId={selectedId} onClose={() => setSelectedId(null)} />
      <TenantFormPanel open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  )
}
