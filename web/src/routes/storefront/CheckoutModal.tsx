import { useState } from 'react'
import { Lock } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useCheckout } from '../../api/storefront'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Sheet } from '../../components/ui/Sheet'
import { useCart } from '../../lib/cart'
import { formatKES } from '../../lib/formatKES'

interface CheckoutModalProps {
  slug: string
  open: boolean
  onClose: () => void
}

const MSISDN_PATTERN = /^(?:254|0)([71]\d{8})$/

export function CheckoutModal({ slug, open, onClose }: CheckoutModalProps) {
  const { items, subtotal, clear } = useCart()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const checkout = useCheckout(slug)

  const handlePay = () => {
    const match = phone.replace(/\s+/g, '').match(MSISDN_PATTERN)

    if (!match) {
      setError('Enter a valid Safaricom number, e.g. 07XX XXX XXX')
      return
    }

    setError(null)

    checkout.mutate(
      {
        customer_msisdn: `254${match[1]}`,
        items: items.map(({ product, quantity }) => ({ product_id: product.id, quantity })),
      },
      {
        onSuccess: (data) => {
          clear()
          navigate(`/shop/${slug}/orders/${data.order_id}`)
        },
        onError: () => {
          setError('Something went wrong starting the payment. Please try again.')
        },
      },
    )
  }

  return (
    <Sheet open={open} onClose={onClose} side="center" closeDisabled={checkout.isPending} title="Confirm your order">
      <ul className="mb-4 space-y-1 text-sm">
        {items.map(({ product, quantity }) => (
          <li key={product.id} className="flex justify-between text-text-muted">
            <span>
              {quantity} × {product.name}
            </span>
            <span className="tabular-nums">{formatKES(Number(product.price) * quantity)}</span>
          </li>
        ))}
      </ul>

      <Input
        label="M-Pesa number"
        id="msisdn"
        type="tel"
        inputMode="numeric"
        placeholder="07XX XXX XXX"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        disabled={checkout.isPending}
        error={error ?? undefined}
      />

      <Button type="button" className="mt-3 w-full" loading={checkout.isPending} onClick={handlePay}>
        {checkout.isPending ? (
          'Sending request to your phone…'
        ) : (
          <>
            <Lock className="h-4 w-4" />
            {`Pay ${formatKES(subtotal)} with M-Pesa`}
          </>
        )}
      </Button>

      {!checkout.isPending && (
        <button type="button" onClick={onClose} className="mt-3 w-full text-center text-sm text-text-muted">
          Cancel
        </button>
      )}
    </Sheet>
  )
}
