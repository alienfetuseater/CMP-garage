import { describe, expect, it } from 'vitest'
import { formatLocalDate, formatLocalDateTime, toLocalDateKey } from './format'

describe('shared/datetime/format', () => {
  it('formats date-only strings using local calendar parts', () => {
    expect(toLocalDateKey('2026-07-27')).toBe('2026-07-27')
  })

  it('handles invalid date values gracefully', () => {
    expect(toLocalDateKey('not-a-date')).toBe('not-a-date')
    expect(formatLocalDate('', 'en-US')).toBe('')
  })

  it('formats valid values for date and date-time', () => {
    const value = '2026-07-27T13:45:00.000Z'

    expect(formatLocalDate(value, 'en-US')).toContain('2026')
    expect(formatLocalDateTime(value, 'en-US')).toContain('2026')
  })
})
