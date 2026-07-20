import { reactive } from 'vue'
import type { Ticket } from '@/types/mock'

export type TicketsState = {
  tickets: Ticket[]
}

export default function state(): TicketsState {
  return reactive({
    tickets: [],
  })
}
