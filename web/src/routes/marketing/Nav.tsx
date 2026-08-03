import { Link } from 'react-router'
import { Button } from '../../components/ui/Button'

export function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span className="font-semibold text-lg text-text">duka-core</span>

        <nav className="hidden items-center gap-8 text-sm font-medium text-text-muted sm:flex">
          <a href="#product" className="hover:text-text">
            Product
          </a>
          <a href="#pricing" className="hover:text-text">
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-text-muted hover:text-text">
            Log in
          </Link>
          <Link to="/register">
            <Button className="px-4 py-2 text-sm">Get started</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
