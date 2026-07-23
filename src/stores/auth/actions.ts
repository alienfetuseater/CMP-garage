import { computed } from 'vue'
import { apiFetch } from '@/api'
import type { AuthState, AuthUser } from './state'

type AuthResponse = {
  token: string
  user: AuthUser
}

const AUTH_TOKEN_KEY = 'cmp_auth_token'

const saveToken = (token: string) => {
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token)
  else localStorage.removeItem(AUTH_TOKEN_KEY)
}

const parseErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message
  return String(error)
}

const applySession = (state: AuthState, payload: AuthResponse) => {
  state.token = payload.token
  state.user = payload.user
  state.error = null
  saveToken(payload.token)
}

export const isAuthenticated = (state: AuthState) =>
  computed(() => Boolean(state.token && state.user))

export const register = async (
  state: AuthState,
  payload: { name: string; email: string; password: string },
) => {
  state.loading = true
  state.error = null

  try {
    const result = await apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    applySession(state, result)
    return result.user
  } catch (error) {
    state.error = parseErrorMessage(error)
    throw error
  } finally {
    state.loading = false
    state.initialized = true
  }
}

export const login = async (state: AuthState, payload: { email: string; password: string }) => {
  state.loading = true
  state.error = null

  try {
    const result = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    applySession(state, result)
    return result.user
  } catch (error) {
    state.error = parseErrorMessage(error)
    throw error
  } finally {
    state.loading = false
    state.initialized = true
  }
}

export const fetchMe = async (state: AuthState) => {
  if (!state.token) return null

  state.loading = true
  state.error = null

  try {
    const result = await apiFetch<{ user: AuthUser }>('/auth/me')
    state.user = result.user
    state.error = null
    return result.user
  } catch (error) {
    state.error = parseErrorMessage(error)
    state.token = ''
    state.user = null
    saveToken('')
    return null
  } finally {
    state.loading = false
    state.initialized = true
  }
}

export const initializeAuth = async (state: AuthState) => {
  if (state.initialized) return state.user
  if (!state.token) {
    state.initialized = true
    return null
  }
  return fetchMe(state)
}

export const logout = (state: AuthState) => {
  state.token = ''
  state.user = null
  state.error = null
  state.initialized = true
  saveToken('')
}
