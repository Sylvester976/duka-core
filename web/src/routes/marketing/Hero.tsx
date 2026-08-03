import { CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(60%_60%_at_50%_0%,_rgba(99,91,255,0.14)_0%,_rgba(99,91,255,0)_70%)]"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-muted">
            Built for Kenyan businesses
          </span>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-text sm:text-5xl">
            Sell online. Get paid on M-Pesa. Today.
          </h1>

          <p className="mt-5 max-w-md text-lg text-text-muted">
            duka-core gives your business a branded storefront, real-time M-Pesa checkout, and a
            dashboard to run it all — live in minutes, not weeks.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/register">
              <Button className="px-6 py-3 text-base">Get started</Button>
            </Link>
            <a href="#pricing">
              <Button variant="secondary" className="px-6 py-3 text-base">
                View pricing
              </Button>
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <Card className="rounded-[var(--radius-lg)] p-6 shadow-lg">
            <p className="text-sm text-text-muted">Jane's Boutique</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums text-text">KES 2,500.00</p>

            <div className="mt-5 flex items-center gap-2 rounded-[var(--radius)] bg-success/10 px-3 py-2.5 text-sm font-medium text-success">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Payment received via M-Pesa
            </div>

            <p className="mt-4 text-xs text-text-subtle">Order #A2F91C · Confirmed just now</p>
          </Card>
        </div>
      </div>
    </section>
  )
}
