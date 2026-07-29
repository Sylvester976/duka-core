import { useState } from 'react'
import { usePlatformTenants, useUpdateTenantStatus } from '../../api/platform'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Checkbox } from '../../components/ui/Checkbox'
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown'
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
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const { data: tenantsPage, isPending } = usePlatformTenants({
    page,
    sort: sort?.column,
    direction: sort?.direction,
  })
  const tenants = tenantsPage?.data
  const updateTenantStatus = useUpdateTenantStatus()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  function goToPage(next: number) {
    setSelected(new Set())
    setPage(next)
  }

  function toggleSort(column: SortColumn) {
    setSelected(new Set())
    setPage(1)
    setSort((current) => {
      if (current?.column !== column) return { column, direction: 'asc' }
      if (current.direction === 'asc') return { column, direction: 'desc' }
      return null
    })
  }

  function toggleSelected(id: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelected((current) => {
      if (tenants && current.size === tenants.length) return new Set()
      return new Set(tenants?.map((tenant) => tenant.id))
    })
  }

  async function bulkSetStatus(status: 'active' | 'suspended') {
    await Promise.all([...selected].map((id) => updateTenantStatus.mutateAsync({ id, status })))
    setSelected(new Set())
  }

  const allSelected = Boolean(tenants?.length) && selected.size === tenants?.length

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl">Tenants</h1>
        <Button type="button" onClick={() => setFormOpen(true)}>
          New tenant
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        {selected.size > 0 && (
          <div className="flex items-center gap-3 border-b border-border bg-surface-2 px-4 py-2 text-sm">
            <span className="text-text-muted">{selected.size} selected</span>
            <Button
              type="button"
              variant="ghost"
              className="min-h-8 px-2 text-sm"
              onClick={() => bulkSetStatus('suspended')}
            >
              Suspend selected
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="min-h-8 px-2 text-sm"
              onClick={() => bulkSetStatus('active')}
            >
              Reactivate selected
            </Button>
          </div>
        )}
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell className="w-8">
                <Checkbox checked={allSelected} onChange={toggleSelectAll} aria-label="Select all tenants" />
              </TableHeaderCell>
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
              <TableHeaderCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {tenants?.map((tenant) => (
              <TableRow
                key={tenant.id}
                onClick={() => setSelectedId(tenant.id)}
                className="cursor-pointer hover:bg-surface-2"
              >
                <TableCell onClick={(event) => event.stopPropagation()}>
                  <Checkbox
                    checked={selected.has(tenant.id)}
                    onChange={() => toggleSelected(tenant.id)}
                    aria-label={`Select ${tenant.name}`}
                  />
                </TableCell>
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
                <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                  <Dropdown>
                    {tenant.status === 'active' ? (
                      <DropdownItem
                        variant="danger"
                        onClick={() => updateTenantStatus.mutate({ id: tenant.id, status: 'suspended' })}
                      >
                        Suspend
                      </DropdownItem>
                    ) : (
                      <DropdownItem onClick={() => updateTenantStatus.mutate({ id: tenant.id, status: 'active' })}>
                        Reactivate
                      </DropdownItem>
                    )}
                  </Dropdown>
                </TableCell>
              </TableRow>
            ))}
            {!isPending && tenants?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                  No tenants yet.
                </td>
              </tr>
            )}
          </TableBody>
        </Table>
        {tenantsPage && (
          <Pagination currentPage={tenantsPage.current_page} lastPage={tenantsPage.last_page} onPageChange={goToPage} />
        )}
      </Card>

      <TenantDetailPanel tenantId={selectedId} onClose={() => setSelectedId(null)} />
      <TenantFormPanel open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  )
}
