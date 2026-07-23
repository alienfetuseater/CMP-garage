import { reactive } from 'vue'

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
    token: localStorage.getItem('cmp_auth_token') || '',
    user: null,
    loading: false,
    initialized: false,
    error: null,
  })
}
