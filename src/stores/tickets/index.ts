import { defineStore } from 'pinia'
import state from './state'
import * as actions from './actions'
import type { Ticket } from '@/types/mock'

export const useTicketStore = defineStore('tickets', () => {
  const s = state()

  return {
    ...s,
    fetchTickets: (force?: boolean) => actions.fetchTickets(s, force),
    addTicket: (ticket: Ticket) => actions.addTicket(s, ticket),
    ticketById: (id: string) => actions.ticketById(s, id),
    ticketsForVessel: (vesselId: string) => actions.ticketsForVessel(s, vesselId),
  }
})
