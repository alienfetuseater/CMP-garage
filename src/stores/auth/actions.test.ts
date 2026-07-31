import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchMe, initializeAuth, login, logout, register } from './actions'
import { AUTH_TOKEN_KEY } from './session'
import type { AuthState } from './state'
import { apiFetch } from '@/services/http/client'

vi.mock('@/services/http/client', () => ({
  apiFetch: vi.fn(),
}))

const mockedApiFetch = vi.mocked(apiFetch)

type MemoryStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'clear'>

const createMemoryStorage = (): MemoryStorage => {
  const store = new Map<string, string>()

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
  }
}

const createAuthState = (overrides: Partial<AuthState> = {}): AuthState => ({
  token: '',
  user: null,
  loading: false,
  initialized: false,
  error: null,
  ...overrides,
})

describe('stores/auth/actions', () => {
  beforeEach(() => {
    mockedApiFetch.mockReset()
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: createMemoryStorage(),
    })
  })

  it('register creates a user without replacing the creator session', async () => {
    const state = createAuthState({
      token: 'creator-token',
      user: {
        id: 'creator-1',
        name: 'Existing User',
        email: 'existing@example.com',
        role: 'serviceManager',
      },
    })
    localStorage.setItem(AUTH_TOKEN_KEY, 'creator-token')

    mockedApiFetch.mockResolvedValue({
      user: {
        id: 'u-1',
        name: 'User One',
        email: 'user.one@example.com',
        role: 'technician',
      },
    })

    const user = await register(state, {
      name: 'User One',
      email: 'user.one@example.com',
      password: 'password123',
      role: 'technician',
    })

    expect(user.id).toBe('u-1')
    expect(state.token).toBe('creator-token')
    expect(state.user?.id).toBe('creator-1')
    expect(state.loading).toBe(false)
    expect(state.initialized).toBe(true)
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe('creator-token')
  })

  it('login surfaces API errors and marks state initialized', async () => {
    const state = createAuthState()
    mockedApiFetch.mockRejectedValue(new Error('Unauthorized'))

    await expect(
      login(state, {
        email: 'bad@example.com',
        password: 'bad-password',
      }),
    ).rejects.toThrow('Unauthorized')

    expect(state.error).toBe('Unauthorized')
    expect(state.loading).toBe(false)
    expect(state.initialized).toBe(true)
  })

  it('fetchMe returns null early when token is missing', async () => {
    const state = createAuthState({ token: '' })

    const result = await fetchMe(state)

    expect(result).toBeNull()
    expect(mockedApiFetch).not.toHaveBeenCalled()
  })

  it('fetchMe clears session when API rejects', async () => {
    const state = createAuthState({
      token: 'stale-token',
      user: {
        id: 'u-1',
        name: 'User One',
        email: 'user.one@example.com',
        role: 'serviceManager',
      },
    })

    localStorage.setItem(AUTH_TOKEN_KEY, 'stale-token')
    mockedApiFetch.mockRejectedValue(new Error('Token expired'))

    const result = await fetchMe(state)

    expect(result).toBeNull()
    expect(state.token).toBe('')
    expect(state.user).toBeNull()
    expect(state.error).toBe('Token expired')
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull()
  })

  it('initializeAuth short-circuits when already initialized or token missing', async () => {
    const initializedState = createAuthState({
      initialized: true,
      user: {
        id: 'u-1',
        name: 'User One',
        email: 'user.one@example.com',
        role: 'serviceManager',
      },
    })

    const initializedResult = await initializeAuth(initializedState)
    expect(initializedResult?.id).toBe('u-1')

    const noTokenState = createAuthState({ token: '' })
    const noTokenResult = await initializeAuth(noTokenState)
    expect(noTokenResult).toBeNull()
    expect(noTokenState.initialized).toBe(true)
  })

  it('logout clears session identity and leaves initialized state true', () => {
    const state = createAuthState({
      token: 'token-1',
      user: {
        id: 'u-1',
        name: 'User One',
        email: 'user.one@example.com',
        role: 'serviceManager',
      },
      error: 'stale',
      initialized: false,
    })

    localStorage.setItem(AUTH_TOKEN_KEY, 'token-1')

    logout(state)

    expect(state.token).toBe('')
    expect(state.user).toBeNull()
    expect(state.error).toBeNull()
    expect(state.initialized).toBe(true)
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull()
  })
})
