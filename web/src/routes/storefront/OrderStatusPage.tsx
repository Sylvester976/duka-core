import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useOrderStatus, useStorefront } from '../../api/storefront'
import { Button } from '../../components/ui/Button'
import { formatKES } from '../../lib/formatKES'
import { applyBrandTokens, resetBrandTokens } from '../../lib/theme'

export function OrderStatusPage() {
  const { slug = '', orderId = '' } = useParams()
  const navigate = useNavigate()
  const { data: tenant } = useStorefront(slug)
  const { data: order, isPending } = useOrderStatus(slug, orderId)

  useEffect(() => {
    if (tenant?.brand_primary) {
      applyBrandTokens(tenant.brand_primary)
    }
    return resetBrandTokens
  }, [tenant?.brand_primary])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg px-6 text-center text-text">
      {isPending || !order ? (
        <p className="text-text-muted">Loading…</p>
      ) : order.status === 'pending' ? (
        <>
          <div className="mb-6 h-16 w-16 animate-pulse rounded-full bg-brand/20" />
          <h1 className="mb-2 text-xl font-semibold">Check your phone</h1>
          <p className="max-w-xs text-text-muted">
            Enter your M-Pesa PIN to confirm {formatKES(order.amount)}
            {tenant ? ` to ${tenant.name}` : ''}.
          </p>
        </>
      ) : order.status === 'paid' ? (
        <>
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h1 className="mb-2 text-xl font-semibold">Payment received</h1>
          <p className="mb-1 text-text-muted">Thank you!</p>
          <p className="mb-6 font-semibold tabular-nums">{formatKES(order.amount)}</p>
          <p className="text-xs text-text-subtle">Order ref: {order.id}</p>
        </>
      ) : (
        <>
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-surface-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-text-subtle"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </div>
          <h1 className="mb-2 text-xl font-semibold">
            {order.status === 'expired' ? 'Payment expired' : 'Payment failed'}
          </h1>
          <p className="mb-6 text-text-muted">No charge was made. You can try again.</p>
          <Button type="button" onClick={() => navigate(`/shop/${slug}`)}>
            Try again
          </Button>
        </>
      )}
    </div>
  )
}
