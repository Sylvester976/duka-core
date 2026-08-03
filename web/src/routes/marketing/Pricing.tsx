import { Check } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ContactModal } from './ContactModal'

// Placeholder — the owner will be able to set this per-tenant/plan later.
const STANDARD_MONTHLY_FEE = 'KES 2,500'

const STANDARD_FEATURES = [
  'Branded storefront + M-Pesa checkout',
  'Orders, payouts & reports dashboard',
  'Up to 5 employee accounts',
  'Your own custom domain',
]

const CUSTOM_FEATURES = [
  'Everything in Standard',
  'Bespoke frontend built for your brand',
  'Headless API access for your own team',
  'Dedicated onboarding & support',
]

export function Pricing() {
  const [contactOpen, setContactOpen] = useState(false)

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-text">Simple, honest pricing</h2>
        <p className="mt-3 text-text-muted">Start self-serve, or have us build it for you.</p>
      </div>

      <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
        <Card className="relative flex flex-col p-8 ring-1 ring-brand">
          <span className="absolute -top-3 left-8 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-brand-contrast">
            Most popular
          </span>

          <h3 className="font-semibold text-lg text-text">Standard</h3>
          <p className="mt-1 text-sm text-text-muted">Self-serve. Live today.</p>

          <p className="mt-6">
            <span className="text-3xl font-semibold tabular-nums text-text">{STANDARD_MONTHLY_FEE}</span>
            <span className="text-text-muted"> / month</span>
          </p>

          <ul className="mt-6 flex-1 space-y-3">
            {STANDARD_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-text-muted">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                {feature}
              </li>
            ))}
          </ul>

          <Link to="/register" className="mt-8">
            <Button className="w-full">Get started</Button>
          </Link>
        </Card>

        <Card className="flex flex-col p-8">
          <h3 className="font-semibold text-lg text-text">Custom</h3>
          <p className="mt-1 text-sm text-text-muted">White-glove build, on your terms.</p>

          <p className="mt-6">
            <span className="text-3xl font-semibold text-text">Contact us</span>
          </p>

          <ul className="mt-6 flex-1 space-y-3">
            {CUSTOM_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-text-muted">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                {feature}
              </li>
            ))}
          </ul>

          <Button variant="secondary" className="mt-8" onClick={() => setContactOpen(true)}>
            Contact sales
          </Button>
        </Card>
      </div>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </section>
  )
}
