import { describe, expect, it } from 'vitest'
import { hasPermission, normalizeUserRole } from './permissions'

describe('role permissions', () => {
  it('allows supervisors to register and view users without editing profiles', () => {
    expect(hasPermission('admin', 'users:create')).toBe(true)
    expect(hasPermission('admin', 'settings:manage')).toBe(true)
    expect(hasPermission('serviceManager', 'users:create')).toBe(true)
    expect(hasPermission('serviceManager', 'users:read')).toBe(true)
    expect(hasPermission('serviceManager', 'users:assignRole')).toBe(false)
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
    expect(hasPermission(role, 'users:create')).toBe(true)
    expect(hasPermission(role, 'users:assignRole')).toBe(false)
  })
})