import { apiFetch } from '@/api'
import type { Reminder } from '@/types/mock'
import type { RemindersState } from './state'
import { useUiStore } from '@/stores/ui'
import { normalizeConversationMessages } from '@/utils/conversations'

type ReminderApiRecord = Reminder & {
  _id?: string
  dueDate?: string
  relatedTo?: {
    type: 'customer' | 'vessel' | 'ticket' | 'other'
    id?: string
    _id?: string
  }
}

const normalizeReminder = (record: ReminderApiRecord): Reminder => {
  const normalizedId = String(record.id ?? record._id ?? '')
  const relatedId = String(record.relatedTo?.id ?? record.relatedTo?._id ?? '')

  return {
    ...record,
    id: normalizedId,
    notes: String(record.notes ?? ''),
    archivedByUserIds: Array.isArray(record.archivedByUserIds)
      ? record.archivedByUserIds.map((entry) => String(entry ?? '').trim()).filter(Boolean)
      : [],
    messages: normalizeConversationMessages(record.messages),
    relatedTo: {
      type: record.relatedTo?.type ?? 'customer',
      id: relatedId,
    },
  }
}

export const fetchReminders = async (state: RemindersState, force = false) => {
  if (!force && state.reminders.length > 0) return state.reminders
  const data = await apiFetch<ReminderApiRecord[]>('/getAllReminders')
  const normalized = data.map(normalizeReminder)
  state.reminders.splice(0, state.reminders.length, ...normalized)
  return state.reminders
}

export const addReminder = (state: RemindersState, reminder: Reminder) => {
  const normalized = normalizeReminder(reminder)
  const index = state.reminders.findIndex((t) => t.id === normalized.id)
  if (index >= 0) state.reminders[index] = normalized
  else state.reminders.push(normalized)
}

export const reminderById = (state: RemindersState, id: string) => {
  return state.reminders.find((t) => String(t.id) === String(id)) ?? null
}

export const remindersForVessel = (state: RemindersState, vesselId: string) => {
  return state.reminders.filter(
    (t) => t.relatedTo?.type === 'vessel' && t.relatedTo.id === vesselId,
  )
}

export const getReminder = async (state: RemindersState, id: string) => {
  const ui = useUiStore()
  await ui.ensureAllData()
  return reminderById(state, id)
}
