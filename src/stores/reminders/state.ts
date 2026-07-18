import type { Reminder } from '@/types/mock'

export type RemindersState = {
  reminders: Reminder[]
}

export default function state(): RemindersState {
  return {
    reminders: [],
  }
}
