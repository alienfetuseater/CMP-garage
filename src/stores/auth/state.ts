import { reactive } from 'vue'
import { readPersistedAuthToken } from './session'

export type AuthUser = {
  id: string
  name: string
  email: string
  role: string
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
