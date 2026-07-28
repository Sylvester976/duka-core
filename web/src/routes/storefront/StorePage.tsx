import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { useStorefront } from '../../api/storefront'
import { CartProvider, useCart } from '../../lib/cart'
import { applyBrandTokens, resetBrandTokens } from '../../lib/theme'
import { CartDrawer } from './CartDrawer'
import { CheckoutModal } from './CheckoutModal'
import { ProductGrid } from './ProductGrid'

function StorePageContent() {
  const { slug = '' } = useParams()
  const { data: tenant, isPending, isError } = useStorefront(slug)
  const { count } = useCart()
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  useEffect(() => {
    if (tenant?.brand_primary) {
      applyBrandTokens(tenant.brand_primary)
    }
    return resetBrandTokens
  }, [tenant?.brand_primary])

  if (isPending) {
    return <StorePageSkeleton />
  }

  if (isError || !tenant) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white px-6 text-center">
        <p className="text-zinc-500">This store isn't available right now.</p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-bg text-text">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-bg/95 px-4 py-3 backdrop-blur">
        {tenant.brand_logo_url ? (
          <img
            src={tenant.brand_logo_url}
            alt=""
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-contrast">
            {tenant.name.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-[15px] font-semibold leading-tight">{tenant.name}</p>
          <p className="text-xs text-text-muted">Pay securely with M-Pesa</p>
        </div>
      </header>

      <main className="px-4 py-4">
        <ProductGrid products={tenant.products} />
      </main>

      {count > 0 && (
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="fixed inset-x-4 bottom-4 z-20 flex min-h-11 items-center justify-between rounded-[var(--radius)] bg-brand px-4 text-brand-contrast shadow-lg"
        >
          <span className="font-semibold">
            {count} item{count > 1 ? 's' : ''} in cart
          </span>
          <span className="font-semibold">View cart</span>
        </button>
      )}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false)
          setCheckoutOpen(true)
        }}
      />

      <CheckoutModal slug={slug} open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </div>
  )
}

function StorePageSkeleton() {
  return (
    <div className="min-h-dvh bg-white p-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-9 w-9 animate-pulse rounded-full bg-zinc-200" />
        <div className="h-4 w-32 animate-pulse rounded bg-zinc-200" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-[10px] bg-zinc-200" />
        ))}
      </div>
    </div>
  )
}

export function StorePage() {
  return (
    <CartProvider>
      <StorePageContent />
    </CartProvider>
  )
}
