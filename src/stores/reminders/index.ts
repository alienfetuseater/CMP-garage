import { defineStore } from 'pinia'
import state from './state'
import * as actions from './actions'
import type { Reminder } from '@/types/mock'

export const useReminderStore = defineStore('reminders', () => {
  const s = state()

  return Object.assign(s, {
    fetchReminders: (force?: boolean) => actions.fetchReminders(s, force),
    addReminder: (reminder: Reminder) => actions.addReminder(s, reminder),
    reminderById: (id: string) => actions.reminderById(s, id),
    remindersForVessel: (id: string) => actions.remindersForVessel(s, id),
    getReminder: (id: string) => actions.getReminder(s, id),
  })
})
