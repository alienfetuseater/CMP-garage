import { describe, expect, it } from 'vitest'
import { normalizeUserRole } from './permissions'

describe('role normalization', () => {
  it('normalizes legacy, current, and unknown roles', () => {
    expect(normalizeUserRole('user')).toBe('serviceManager')
    expect(normalizeUserRole('technician')).toBe('technician')
    expect(normalizeUserRole('unknown')).toBe('viewer')
  })
})
