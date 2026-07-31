import { reactive } from 'vue'
import { readPersistedAuthToken } from './session'
import type { UserRole } from '@/domain/auth/permissions'

export type AuthUser = {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt?: string
}

export type AuthState = {
  token: string
  user: AuthUser | null
  loading: boolean
  initialized: boolean
  error: string | null
}

export default function state(): AuthState {
  return reactive({
    token: readPersistedAuthToken(localStorage),
    user: null,
    loading: false,
    initialized: false,
    error: null,
  })
}
