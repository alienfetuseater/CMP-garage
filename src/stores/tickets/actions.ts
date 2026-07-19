import { apiFetch } from '@/api'
import type { Ticket } from '@/types/mock'
import type { TicketsState } from './state'
import { useUiStore } from '@/stores/ui'

type TicketApiRecord = Ticket & {
  _id?: string
}

const normalizeTicket = (record: TicketApiRecord): Ticket => {
  return {
    ...record,
    id: String(record.id ?? record._id ?? ''),
  }
}

export const fetchTickets = async (state: TicketsState, force = false) => {
  if (!force && state.tickets.length > 0) return state.tickets
  const data = await apiFetch<TicketApiRecord[]>('/getAllTickets')
  const normalized = data.map(normalizeTicket)
  state.tickets.splice(0, state.tickets.length, ...normalized)
  return state.tickets
}

export const addTicket = (state: TicketsState, ticket: Ticket) => {
  const index = state.tickets.findIndex((t) => t.id === ticket.id)
  if (index >= 0) state.tickets[index] = ticket
  else state.tickets.push(ticket)
}

export const ticketById = (state: TicketsState, id: string) => {
  return state.tickets.find((t) => String(t.id) === String(id)) ?? null
}

export const ticketsForVessel = (state: TicketsState, vesselId: string) => {
  return state.tickets.filter((t) => t.vesselId === vesselId)
}

export const getTicket = async (state: TicketsState, id: string) => {
  const ui = useUiStore()
  await ui.ensureAllData()
  return ticketById(state, id)
}
