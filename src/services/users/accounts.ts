import { apiFetch } from '@/services/http/client'
import type { AuthUser } from '@/stores/auth/state'
import type { UserRole } from '@/domain/auth/permissions'

export type UpdateUserPayload = {
  name: string
  email: string
  role: UserRole
}

export function fetchUsers(): Promise<AuthUser[]> {
  return apiFetch<AuthUser[]>('/users')
}

export function fetchAssignableUsers(): Promise<AuthUser[]> {
  return apiFetch<AuthUser[]>('/users/assignable')
}

export function fetchAssignmentAccess(): Promise<{ canDelegate: boolean }> {
  return apiFetch<{ canDelegate: boolean }>('/assignments/access')
}

export function fetchAssignmentBoardAccess(): Promise<{ canView: boolean }> {
  return apiFetch<{ canView: boolean }>('/assignments/board-access')
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<AuthUser> {
  const result = await apiFetch<{ user: AuthUser }>(`/users/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return result.user
}

export type UserAccess = {
  canRead: boolean
  canCreate: boolean
  canEdit: boolean
}

export function fetchUserAccess(): Promise<UserAccess> {
  return apiFetch<UserAccess>('/users/access')
}
