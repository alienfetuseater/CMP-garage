import { defineStore } from 'pinia'
import state from './state'
import * as actions from './actions'
import type { Ticket } from '@/types/mock'

export const useTicketStore = defineStore('tickets', () => {
  const s = state()

  return Object.assign(s, {
    fetchTickets: (force?: boolean) => actions.fetchTickets(s, force),
    addTicket: (ticket: Ticket) => actions.addTicket(s, ticket),
    ticketById: (id: string) => actions.ticketById(s, id),
    ticketsForVessel: (id: string) => actions.ticketsForVessel(s, id),
    getTicket: (id: string) => actions.getTicket(s, id),
  })
})
