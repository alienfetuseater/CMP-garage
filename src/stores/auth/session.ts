import type { AuthState, AuthUser } from './state'

export type AuthResponse = {
  token: string
  user: AuthUser
}

export const AUTH_TOKEN_KEY = 'cmp_auth_token'

export const persistAuthToken = (
  token: string,
  storage: Pick<Storage, 'setItem' | 'removeItem'>,
) => {
  if (token) {
    storage.setItem(AUTH_TOKEN_KEY, token)
    return
  }

  storage.removeItem(AUTH_TOKEN_KEY)
}

export const readPersistedAuthToken = (storage: Pick<Storage, 'getItem'>): string => {
  return storage.getItem(AUTH_TOKEN_KEY) || ''
}

export const parseAuthErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message
  return String(error)
}

// Centralize session writes so login/register/fetchMe keep identical state transitions.
export const applyAuthSession = (
  state: AuthState,
  payload: AuthResponse,
  storage: Pick<Storage, 'setItem' | 'removeItem'>,
) => {
  state.token = payload.token
  state.user = payload.user
  state.error = null
  persistAuthToken(payload.token, storage)
}

// Keep this reset path explicit so logout and auth failures clear all identity state.
export const clearAuthSession = (
  state: AuthState,
  storage: Pick<Storage, 'setItem' | 'removeItem'>,
) => {
  state.token = ''
  state.user = null
  persistAuthToken('', storage)
}
