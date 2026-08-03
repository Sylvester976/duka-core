export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm text-text-subtle sm:flex-row">
        <span>© {new Date().getFullYear()} duka-core. All rights reserved.</span>
        <div className="flex items-center gap-6">
          <a href="#product" className="hover:text-text-muted">
            Product
          </a>
          <a href="#pricing" className="hover:text-text-muted">
            Pricing
          </a>
        </div>
      </div>
    </footer>
  )
}
