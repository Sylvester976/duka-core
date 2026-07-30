import { useState } from 'react'
import { useDashboardProducts, useDeleteProduct, useUpdateProduct, type Product } from '../../api/dashboard'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Checkbox } from '../../components/ui/Checkbox'
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown'
import { Pagination } from '../../components/ui/Pagination'
import { Switch } from '../../components/ui/Switch'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../components/ui/Table'
import { formatKES } from '../../lib/formatKES'
import { ProductFormPanel } from './ProductFormPanel'

type SortColumn = 'name' | 'price'
type SortState = { column: SortColumn; direction: 'asc' | 'desc' } | null

export function Products() {
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<SortState>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const { data: productsPage, isPending } = useDashboardProducts({
    page,
    sort: sort?.column,
    direction: sort?.direction,
  })
  const products = productsPage?.data
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()
  const [panel, setPanel] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null,
  })

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
      if (products && current.size === products.length) return new Set()
      return new Set(products?.map((product) => product.id))
    })
  }

  async function bulkSetActive(isActive: boolean) {
    await Promise.all([...selected].map((id) => updateProduct.mutateAsync({ id, is_active: isActive })))
    setSelected(new Set())
  }

  async function bulkDelete() {
    if (!confirm(`Delete ${selected.size} selected product(s)?`)) return
    await Promise.all([...selected].map((id) => deleteProduct.mutateAsync(id)))
    setSelected(new Set())
  }

  const allSelected = Boolean(products?.length) && selected.size === products?.length

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-semibold text-2xl">Products</h1>
        <Button type="button" onClick={() => setPanel({ open: true, product: null })}>
          Add product
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        {selected.size > 0 && (
          <div className="flex items-center gap-3 border-b border-border bg-surface-2 px-4 py-2 text-sm">
            <span className="text-text-muted">{selected.size} selected</span>
            <Button type="button" variant="ghost" className="min-h-8 px-2 text-sm" onClick={() => bulkSetActive(true)}>
              Activate
            </Button>
            <Button type="button" variant="ghost" className="min-h-8 px-2 text-sm" onClick={() => bulkSetActive(false)}>
              Deactivate
            </Button>
            <Button type="button" variant="ghost" className="min-h-8 px-2 text-sm text-danger" onClick={bulkDelete}>
              Delete selected
            </Button>
          </div>
        )}
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell className="w-8">
                <Checkbox checked={allSelected} onChange={toggleSelectAll} aria-label="Select all products" />
              </TableHeaderCell>
              <TableHeaderCell
                sortable
                sortDirection={sort?.column === 'name' ? sort.direction : null}
                onSort={() => toggleSort('name')}
              >
                Name
              </TableHeaderCell>
              <TableHeaderCell
                sortable
                sortDirection={sort?.column === 'price' ? sort.direction : null}
                onSort={() => toggleSort('price')}
              >
                Price
              </TableHeaderCell>
              <TableHeaderCell>Active</TableHeaderCell>
              <TableHeaderCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {products?.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Checkbox
                    checked={selected.has(product.id)}
                    onChange={() => toggleSelected(product.id)}
                    aria-label={`Select ${product.name}`}
                  />
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell className="tabular-nums">{formatKES(product.price)}</TableCell>
                <TableCell>
                  <Switch
                    checked={product.is_active}
                    onChange={(checked) => updateProduct.mutate({ id: product.id, is_active: checked })}
                    aria-label={`Toggle ${product.name} active`}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Dropdown>
                    <DropdownItem onClick={() => setPanel({ open: true, product })}>Edit</DropdownItem>
                    <DropdownItem
                      variant="danger"
                      onClick={() => {
                        if (confirm(`Delete ${product.name}?`)) {
                          deleteProduct.mutate(product.id)
                        }
                      }}
                    >
                      Delete
                    </DropdownItem>
                  </Dropdown>
                </TableCell>
              </TableRow>
            ))}
            {!isPending && products?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                  Add your first product.
                </td>
              </tr>
            )}
          </TableBody>
        </Table>
        {productsPage && (
          <Pagination currentPage={productsPage.current_page} lastPage={productsPage.last_page} onPageChange={goToPage} />
        )}
      </Card>

      <ProductFormPanel
        product={panel.product}
        open={panel.open}
        onClose={() => setPanel({ open: false, product: null })}
      />
    </div>
  )
}
