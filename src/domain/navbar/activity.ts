export function reminderSortKey(dueDate?: string) {
  if (!dueDate) return Number.POSITIVE_INFINITY

  const timestamp = new Date(dueDate).getTime()
  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp
}

export function isTicketOpen(status?: string) {
  const normalized = String(status || '')
    .trim()
    .toLowerCase()
  return normalized !== 'closed' && normalized !== 'completed' && normalized !== 'cancelled'
}

export function toBadgeCountLabel(value: number) {
  return value > 99 ? '99+' : String(value)
}
