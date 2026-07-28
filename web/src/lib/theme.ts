function contrastFor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#2A2722' : '#F7F4EE'
}

export function applyBrandTokens(brandPrimary: string) {
  const root = document.documentElement.style
  root.setProperty('--brand', brandPrimary)
  root.setProperty('--brand-contrast', contrastFor(brandPrimary))
}

export function resetBrandTokens() {
  const root = document.documentElement.style
  root.removeProperty('--brand')
  root.removeProperty('--brand-contrast')
}
