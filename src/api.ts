const API_BASE = 'http://localhost:5173/api/CMPGarage'

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, options)
  if (!res.ok) {
    const errorText = await res.text().catch(() => res.statusText)
    throw new Error(`${res.status} ${res.statusText}: ${errorText}`)
  }
  return await res.json()
}
