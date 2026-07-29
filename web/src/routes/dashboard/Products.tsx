import { useState } from 'react'
import { useDashboardProducts, useDeleteProduct, useUpdateProduct, type Product } from '../../api/dashboard'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
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
        <h1 className="font-serif text-2xl">Products</h1>
        <Button type="button" onClick={() => setPanel({ open: true, product: null })}>
          Add product
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
                  <button
                    type="button"
                    onClick={() => setPanel({ open: true, product })}
                    className="mr-3 text-text-muted hover:text-text"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete ${product.name}?`)) {
                        deleteProduct.mutate(product.id)
                      }
                    }}
                    className="text-danger hover:opacity-80"
                  >
                    Delete
                  </button>
                </TableCell>
              </TableRow>
            ))}
            {!isPending && products?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-text-muted">
                  Add your first product.
                </td>
              </tr>
            )}
          </TableBody>
        </Table>
        {productsPage && (
          <Pagination currentPage={productsPage.current_page} lastPage={productsPage.last_page} onPageChange={setPage} />
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
