import { computed } from 'vue'
import { apiFetch } from '@/services/http/client'
import type { AuthState, AuthUser } from './state'
import {
  type AuthResponse,
  applyAuthSession,
  clearAuthSession,
  parseAuthErrorMessage,
} from './session'

const beginAuthRequest = (state: AuthState) => {
  state.loading = true
  state.error = null
}

const finishAuthRequest = (state: AuthState) => {
  state.loading = false
  state.initialized = true
}

export const isAuthenticated = (state: AuthState) =>
  computed(() => Boolean(state.token && state.user))

export const register = async (
  state: AuthState,
  payload: { name: string; email: string; password: string },
) => {
  beginAuthRequest(state)

  try {
    const result = await apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    applyAuthSession(state, result, localStorage)
    return result.user
  } catch (error) {
    state.error = parseAuthErrorMessage(error)
    throw error
  } finally {
    finishAuthRequest(state)
  }
}

export const login = async (state: AuthState, payload: { email: string; password: string }) => {
  beginAuthRequest(state)

  try {
    const result = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    applyAuthSession(state, result, localStorage)
    return result.user
  } catch (error) {
    state.error = parseAuthErrorMessage(error)
    throw error
  } finally {
    finishAuthRequest(state)
  }
}

export const fetchMe = async (state: AuthState) => {
  if (!state.token) return null

  beginAuthRequest(state)

  try {
    const result = await apiFetch<{ user: AuthUser }>('/auth/me')
    state.user = result.user
    state.error = null
    return result.user
  } catch (error) {
    // An invalid session should always drop local identity state.
    state.error = parseAuthErrorMessage(error)
    clearAuthSession(state, localStorage)
    return null
  } finally {
    finishAuthRequest(state)
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
  clearAuthSession(state, localStorage)
  state.error = null
  state.initialized = true
}
