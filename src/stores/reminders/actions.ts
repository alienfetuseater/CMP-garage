import { apiFetch } from '@/services/http/client'
import type { Reminder } from '@/types/mock'
import type { RemindersState } from './state'
import { useUiStore } from '@/stores/ui'
import { normalizeConversationMessages } from '@/domain/conversations/utils'
import {
  findById,
  replaceCollection,
  resolveRecordId,
  toNormalizedStringList,
  upsertById,
} from '@/stores/shared/records'

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
  const normalizedId = resolveRecordId(record)
  const relatedId = resolveRecordId(record.relatedTo ?? {})

  return {
    ...record,
    id: normalizedId,
    notes: String(record.notes ?? ''),
    // Archived user lists can arrive as mixed values; normalize once at the edge.
    archivedByUserIds: toNormalizedStringList(record.archivedByUserIds),
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
  replaceCollection(state.reminders, normalized)
  return state.reminders
}

export const addReminder = (state: RemindersState, reminder: Reminder) => {
  const normalized = normalizeReminder(reminder)
  upsertById(state.reminders, normalized)
}

export const reminderById = (state: RemindersState, id: string) => {
  return findById(state.reminders, id)
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
