import { beforeEach, describe, expect, it, vi } from 'vitest'
import { API_BASE, apiFetch } from './client'

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

describe('services/http/client', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: createMemoryStorage(),
    })
  })

  it('adds bearer auth from localStorage when header is not provided', async () => {
    localStorage.setItem('cmp_auth_token', 'token-1')
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response)

    const result = await apiFetch<{ ok: boolean }>('/example')

    expect(result.ok).toBe(true)
    expect(fetchSpy).toHaveBeenCalledWith(`${API_BASE}/example`, expect.any(Object))

    const [, options] = fetchSpy.mock.calls[0] ?? []
    const headers = new Headers(options?.headers)
    expect(headers.get('Authorization')).toBe('Bearer token-1')

    fetchSpy.mockRestore()
  })

  it('keeps caller Authorization header when explicitly provided', async () => {
    localStorage.setItem('cmp_auth_token', 'token-1')
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response)

    await apiFetch('/example', {
      headers: {
        Authorization: 'Bearer explicit-token',
      },
    })

    const [, options] = fetchSpy.mock.calls[0] ?? []
    const headers = new Headers(options?.headers)
    expect(headers.get('Authorization')).toBe('Bearer explicit-token')

    fetchSpy.mockRestore()
  })

  it('throws a rich error message for non-ok responses', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: async () => 'Invalid payload',
    } as Response)

    await expect(apiFetch('/example')).rejects.toThrow('400 Bad Request: Invalid payload')

    fetchSpy.mockRestore()
  })
})
