import { Button } from '../../components/ui/Button'
import { useCart } from '../../lib/cart'
import { formatKES } from '../../lib/formatKES'
import type { Product } from '../../lib/types'

export function ProductGrid({ products }: { products: Product[] }) {
  const { add } = useCart()

  if (products.length === 0) {
    return <p className="py-16 text-center text-text-muted">No products yet. Check back soon.</p>
  }

  return (
    <div className="grid grid-cols-2 gap-3 pb-28 sm:grid-cols-3">
      {products.map((product) => (
        <div key={product.id} className="overflow-hidden rounded-[var(--radius)] border border-border">
          <div className="aspect-square bg-surface-2">
            {product.image_url && (
              <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
            )}
          </div>
          <div className="p-3">
            <p className="truncate text-sm font-medium">{product.name}</p>
            <p className="mt-1 font-semibold tabular-nums">{formatKES(product.price)}</p>
            <Button type="button" variant="secondary" className="mt-2 w-full" onClick={() => add(product)}>
              Add
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
