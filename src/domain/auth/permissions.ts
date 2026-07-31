export const userRoles = [
  'admin',
  'serviceManager',
  'technician',
  'coordinator',
  'viewer',
] as const

export type UserRole = (typeof userRoles)[number]

export const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  serviceManager: 'Service Manager',
  technician: 'Technician',
  coordinator: 'Coordinator',
  viewer: 'Viewer',
}

export const rolePermissions = {
  admin: [
    'users:create',
    'users:read',
    'users:assignRole',
    'users:manageAdmins',
    'settings:manage',
    'calendar:view',
    'records:read',
    'customers:manage',
    'vessels:manage',
    'tickets:manage',
    'reports:manage',
    'reminders:manage',
    'messages:manage',
    'records:delete',
    'documents:send',
  ],
  serviceManager: [
    'calendar:view',
    'records:read',
    'customers:manage',
    'vessels:manage',
    'tickets:manage',
    'reports:manage',
    'reminders:manage',
    'messages:manage',
    'records:delete',
    'documents:send',
  ],
  technician: [
    'records:read',
    'tickets:update',
    'reports:create',
    'reports:update',
    'messages:manage',
  ],
  coordinator: [
    'calendar:view',
    'records:read',
    'customers:manage',
    'vessels:manage',
    'tickets:create',
    'reminders:manage',
    'messages:manage',
    'documents:send',
  ],
  viewer: ['records:read'],
} as const satisfies Record<UserRole, readonly string[]>

export type Permission = (typeof rolePermissions)[UserRole][number]

export function normalizeUserRole(role: string): UserRole {
  if (role === 'user') return 'serviceManager'
  return userRoles.includes(role as UserRole) ? (role as UserRole) : 'viewer'
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return (rolePermissions[role] as readonly string[]).includes(permission)
}