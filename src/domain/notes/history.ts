export function splitNoteHistory(notes: string | null | undefined): string[] {
  const raw = String(notes ?? '').trim()
  if (!raw) return []

  return raw
    .split(/\n\s*\n+/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
}
