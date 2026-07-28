import { apiFetch } from '@/services/http/client'
import type { Ticket } from '@/types/mock'
import type { TicketsState } from './state'
import { useUiStore } from '@/stores/ui'
import { normalizeConversationMessages } from '@/domain/conversations/utils'
import {
  findById,
  replaceCollection,
  resolveRecordId,
  toNormalizedStringList,
  upsertById,
} from '@/stores/shared/records'

type TicketApiRecord = Ticket & {
  _id?: string
}

const normalizeTicket = (record: TicketApiRecord): Ticket => {
  return {
    ...record,
    id: resolveRecordId(record),
    // Keep read/archive lists normalized so identity checks stay reliable.
    archivedByUserIds: toNormalizedStringList(record.archivedByUserIds),
    messages: normalizeConversationMessages(record.messages),
  }
}

export const fetchTickets = async (state: TicketsState, force = false) => {
  if (!force && state.tickets.length > 0) return state.tickets
  const data = await apiFetch<TicketApiRecord[]>('/getAllTickets')
  const normalized = data.map(normalizeTicket)
  replaceCollection(state.tickets, normalized)
  return state.tickets
}

export const addTicket = (state: TicketsState, ticket: Ticket) => {
  upsertById(state.tickets, normalizeTicket(ticket))
}

export const ticketById = (state: TicketsState, id: string) => {
  return findById(state.tickets, id)
}

export const ticketsForVessel = (state: TicketsState, vesselId: string) => {
  return state.tickets.filter((t) => t.vesselId === vesselId)
}

export const getTicket = async (state: TicketsState, id: string) => {
  const ui = useUiStore()
  await ui.ensureAllData()
  return ticketById(state, id)
}
