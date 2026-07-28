import { useState } from 'react'
import { useDashboardProducts, useDeleteProduct, useUpdateProduct, type Product } from '../../api/dashboard'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Switch } from '../../components/ui/Switch'
import { formatKES } from '../../lib/formatKES'
import { ProductFormPanel } from './ProductFormPanel'

export function Products() {
  const { data: products, isPending } = useDashboardProducts()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()
  const [panel, setPanel] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null,
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl">Products</h1>
        <Button type="button" onClick={() => setPanel({ open: true, product: null })}>
          Add product
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-subtle">
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Price</th>
              <th className="px-4 py-2 font-medium">Active</th>
              <th className="px-4 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {products?.map((product) => (
              <tr key={product.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5">{product.name}</td>
                <td className="px-4 py-2.5 tabular-nums">{formatKES(product.price)}</td>
                <td className="px-4 py-2.5">
                  <Switch
                    checked={product.is_active}
                    onChange={(checked) => updateProduct.mutate({ id: product.id, is_active: checked })}
                    aria-label={`Toggle ${product.name} active`}
                  />
                </td>
                <td className="px-4 py-2.5 text-right">
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
                </td>
              </tr>
            ))}
            {!isPending && products?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-text-muted">
                  Add your first product.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <ProductFormPanel
        product={panel.product}
        open={panel.open}
        onClose={() => setPanel({ open: false, product: null })}
      />
    </div>
  )
}
