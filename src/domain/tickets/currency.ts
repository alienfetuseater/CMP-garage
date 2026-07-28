export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value || 0)
}

export function sanitizeCurrencyInput(raw: string) {
  const cleaned = String(raw ?? '').replace(/[^\d.]/g, '')
  const firstDotIndex = cleaned.indexOf('.')
  if (firstDotIndex < 0) return cleaned

  const whole = cleaned.slice(0, firstDotIndex)
  const decimals = cleaned
    .slice(firstDotIndex + 1)
    .replace(/\./g, '')
    .slice(0, 2)

  return `${whole}.${decimals}`
}

export function parseCurrencyInputValue(raw: string) {
  const normalized = sanitizeCurrencyInput(raw)
  const parsed = Number.parseFloat(normalized)
  if (!Number.isFinite(parsed) || parsed < 0) return 0
  return Math.round(parsed * 100) / 100
}

export function formatCurrencyInputValue(value: number | undefined) {
  const numeric = Number(value ?? 0)
  if (!Number.isFinite(numeric) || numeric < 0) return '0.00'
  return numeric.toFixed(2)
}
