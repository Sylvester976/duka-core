import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { useCart } from '../../lib/cart'
import { formatKES } from '../../lib/formatKES'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  onCheckout: () => void
}

export function CartDrawer({ open, onClose, onCheckout }: CartDrawerProps) {
  const { items, updateQuantity, subtotal } = useCart()

  return (
    <Sheet open={open} onClose={onClose} side="bottom" title="Your cart">
      {items.length === 0 ? (
          <p className="py-8 text-center text-text-muted">Your cart is empty.</p>
        ) : (
          <ul className="space-y-3">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="text-sm tabular-nums text-text-muted">{formatKES(product.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    aria-label={`Decrease ${product.name} quantity`}
                    className="flex h-8 w-8 items-center justify-center rounded-[var(--radius)] border border-border"
                  >
                    –
                  </button>
                  <span className="w-4 text-center tabular-nums">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    aria-label={`Increase ${product.name} quantity`}
                    className="flex h-8 w-8 items-center justify-center rounded-[var(--radius)] border border-border"
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {items.length > 0 && (
          <div className="mt-4 border-t border-border pt-4">
            <div className="mb-3 flex items-center justify-between font-semibold tabular-nums">
              <span>Total</span>
              <span>{formatKES(subtotal)}</span>
            </div>
            <Button type="button" className="w-full" onClick={onCheckout}>
              Checkout
            </Button>
          </div>
        )}
    </Sheet>
  )
}
