import { apiFetch } from '@/api'
import type { Reminder } from '@/types/mock'
import type { RemindersState } from './state'
import { useUiStore } from '@/stores/ui'

export const fetchReminders = async (state: RemindersState, force = false) => {
  if (!force && state.reminders.length > 0) return state.reminders
  const data = await apiFetch<Reminder[]>('/getAllReminders')
  state.reminders.splice(0, state.reminders.length, ...data)
  return state.reminders
}

export const addReminder = (state: RemindersState, reminder: Reminder) => {
  const index = state.reminders.findIndex((t) => t.id === reminder.id)
  if (index >= 0) state.reminders[index] = reminder
  else state.reminders.push(reminder)
}

export const reminderById = (state: RemindersState, id: string) => {
  return state.reminders.find((t) => t.id === id) ?? null
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
