import { Globe, LayoutDashboard, Smartphone, Store, type LucideIcon } from 'lucide-react'
import { Card } from '../../components/ui/Card'

const FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Store,
    title: 'Your storefront, live in minutes',
    description:
      'A fast, mobile-first shop your customers can buy from — no account required, no friction.',
  },
  {
    icon: Smartphone,
    title: 'Get paid on M-Pesa instantly',
    description:
      'STK push checkout your customers already trust. Confirmed in seconds — no card gateway needed.',
  },
  {
    icon: LayoutDashboard,
    title: 'One dashboard for everything',
    description:
      'Products, orders, and payouts in a single, fast control panel built for a phone-first owner.',
  },
  {
    icon: Globe,
    title: 'Your own domain',
    description:
      'Point your domain at duka-core and your storefront — and your dashboard — run under your brand.',
  },
]

export function ProductStory() {
  return (
    <section id="product" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-text">
          Everything you need to sell, nothing you don't
        </h2>
        <p className="mt-3 text-text-muted">
          duka-core replaces a pile of disconnected tools with one system built for how Kenyan
          businesses actually get paid.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius)] bg-brand/10 text-brand">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-semibold text-text">{title}</h3>
            <p className="mt-1.5 text-sm text-text-muted">{description}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}
