import { describe, expect, it } from 'vitest'
import { hasPermission, normalizeUserRole } from './permissions'

describe('role permissions', () => {
  it('reserves identity and system administration for administrators', () => {
    expect(hasPermission('admin', 'users:create')).toBe(true)
    expect(hasPermission('admin', 'settings:manage')).toBe(true)
    expect(hasPermission('serviceManager', 'users:create')).toBe(false)
    expect(hasPermission('serviceManager', 'settings:manage')).toBe(false)
    expect(hasPermission('serviceManager', 'records:delete')).toBe(true)
  })

  it('does not allow technicians to view the calendar', () => {
    expect(hasPermission('technician', 'calendar:view')).toBe(false)
    expect(hasPermission('technician', 'reports:update')).toBe(true)
  })

  it('normalizes legacy users without granting administrator permissions', () => {
    const role = normalizeUserRole('user')

    expect(role).toBe('serviceManager')
    expect(hasPermission(role, 'users:create')).toBe(false)
  })
})