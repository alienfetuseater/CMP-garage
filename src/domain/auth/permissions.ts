export const userRoles = ['admin', 'serviceManager', 'technician', 'coordinator', 'viewer'] as const

export type UserRole = (typeof userRoles)[number]

export const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  serviceManager: 'Supervisor / Service Manager',
  technician: 'Technician',
  coordinator: 'Coordinator',
  viewer: 'Viewer',
}

export function normalizeUserRole(role: string): UserRole {
  if (role === 'user') return 'serviceManager'
  return userRoles.includes(role as UserRole) ? (role as UserRole) : 'viewer'
}
