import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCheckout } from '../../api/storefront'
import { Button } from '../../components/ui/Button'
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

  if (!open) return null

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
    <div className="fixed inset-0 z-40 flex items-end sm:items-center sm:justify-center">
      <button
        type="button"
        aria-label="Close checkout"
        onClick={onClose}
        disabled={checkout.isPending}
        className="absolute inset-0 bg-black/40 disabled:cursor-not-allowed"
      />
      <div className="relative z-10 w-full max-w-[440px] rounded-t-[14px] bg-surface p-5 sm:rounded-[14px]">
        <h2 className="mb-4 text-lg font-semibold">Confirm your order</h2>

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

        <label className="mb-1 block text-sm font-medium" htmlFor="msisdn">
          M-Pesa number
        </label>
        <input
          id="msisdn"
          type="tel"
          inputMode="numeric"
          placeholder="07XX XXX XXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={checkout.isPending}
          className="mb-1 w-full rounded-[var(--radius)] border border-border bg-transparent px-3 py-2.5 text-[16px] outline-none focus:border-brand disabled:opacity-60"
        />
        {error && <p className="mb-2 text-sm text-danger">{error}</p>}

        <Button type="button" className="mt-3 w-full" loading={checkout.isPending} onClick={handlePay}>
          {checkout.isPending ? 'Sending request to your phone…' : `Pay ${formatKES(subtotal)} with M-Pesa`}
        </Button>

        {!checkout.isPending && (
          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full text-center text-sm text-text-muted"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
