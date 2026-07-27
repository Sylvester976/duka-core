const formatter = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  currencyDisplay: 'code',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatKES(amount: number | string) {
  return formatter.format(typeof amount === 'string' ? Number(amount) : amount)
}
