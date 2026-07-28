import { describe, expect, it, vi } from 'vitest'
import {
  AUTH_TOKEN_KEY,
  applyAuthSession,
  clearAuthSession,
  parseAuthErrorMessage,
  persistAuthToken,
  readPersistedAuthToken,
  type AuthResponse,
} from './session'
import type { AuthState } from './state'

type MemoryStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> & {
  store: Map<string, string>
}

const createMemoryStorage = (): MemoryStorage => {
  const store = new Map<string, string>()

  return {
    store,
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
  }
}

const createAuthState = (): AuthState => ({
  token: '',
  user: null,
  loading: false,
  initialized: false,
  error: 'stale error',
})

describe('stores/auth/session', () => {
  it('persists and clears auth token in storage', () => {
    const storage = createMemoryStorage()

    persistAuthToken('token-1', storage)
    expect(storage.getItem(AUTH_TOKEN_KEY)).toBe('token-1')

    persistAuthToken('', storage)
    expect(storage.getItem(AUTH_TOKEN_KEY)).toBeNull()
  })

  it('reads persisted auth token with empty-string fallback', () => {
    const storage = createMemoryStorage()

    expect(readPersistedAuthToken(storage)).toBe('')

    storage.setItem(AUTH_TOKEN_KEY, 'token-2')
    expect(readPersistedAuthToken(storage)).toBe('token-2')
  })

  it('parses auth errors predictably', () => {
    expect(parseAuthErrorMessage(new Error('Boom'))).toBe('Boom')
    expect(parseAuthErrorMessage('String error')).toBe('String error')
  })

  it('applies session payload to auth state and storage', () => {
    const storage = createMemoryStorage()
    const state = createAuthState()
    const payload: AuthResponse = {
      token: 'jwt-token',
      user: {
        id: 'u-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      },
    }

    applyAuthSession(state, payload, storage)

    expect(state.token).toBe('jwt-token')
    expect(state.user?.id).toBe('u-1')
    expect(state.error).toBeNull()
    expect(storage.getItem(AUTH_TOKEN_KEY)).toBe('jwt-token')
  })

  it('clears session identity data and token storage', () => {
    const storage = createMemoryStorage()
    storage.setItem(AUTH_TOKEN_KEY, 'jwt-token')

    const state = createAuthState()
    state.token = 'jwt-token'
    state.user = {
      id: 'u-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
    }

    clearAuthSession(state, storage)

    expect(state.token).toBe('')
    expect(state.user).toBeNull()
    expect(storage.getItem(AUTH_TOKEN_KEY)).toBeNull()
  })

  it('uses storage remove call when clearing token', () => {
    const storage = createMemoryStorage()
    const removeSpy = vi.spyOn(storage, 'removeItem')

    persistAuthToken('', storage)

    expect(removeSpy).toHaveBeenCalledWith(AUTH_TOKEN_KEY)
  })
})
