export const API_BASE = 'http://localhost:8000/api/CMPGarage'

const AUTH_TOKEN_KEY = 'cmp_auth_token'

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  const providedHeaders = new Headers(options?.headers)

  if (token && !providedHeaders.has('Authorization')) {
    providedHeaders.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: providedHeaders,
  })

  if (!res.ok) {
    const errorText = await res.text().catch(() => res.statusText)
    throw new Error(`${res.status} ${res.statusText}: ${errorText}`)
  }
  return await res.json()
}
