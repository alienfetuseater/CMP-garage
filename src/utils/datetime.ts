const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/

type DateInput = string | number | Date | null | undefined

function parseDateInput(value: DateInput): Date | null {
  if (value === null || value === undefined) return null

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  if (typeof value === 'number') {
    const fromNumber = new Date(value)
    return Number.isNaN(fromNumber.getTime()) ? null : fromNumber
  }

  const raw = String(value).trim()
  if (!raw) return null

  const dateOnlyMatch = raw.match(DATE_ONLY_RE)
  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1])
    const month = Number(dateOnlyMatch[2])
    const day = Number(dateOnlyMatch[3])
    const fromLocalParts = new Date(year, month - 1, day)
    return Number.isNaN(fromLocalParts.getTime()) ? null : fromLocalParts
  }

  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function formatLocalDate(value: DateInput, locale?: string): string {
  const date = parseDateInput(value)
  if (!date) return value ? String(value) : ''

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function formatLocalDateTime(value: DateInput, locale?: string): string {
  const date = parseDateInput(value)
  if (!date) return value ? String(value) : ''

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function toLocalDateKey(value: DateInput): string {
  const date = parseDateInput(value)
  if (!date) {
    const raw = value ? String(value) : ''
    return raw.slice(0, 10)
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
