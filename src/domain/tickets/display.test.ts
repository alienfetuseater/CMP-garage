import { describe, expect, it } from 'vitest'
import { resolveTicketCustomerName, resolveTicketVesselName } from './display'
import type { Customer, Ticket, Vessel } from '@/types/mock'

const ticketBase: Ticket = {
  id: 't-1',
  customerId: 'c-1',
  vesselId: 'v-1',
  service_category: 'repair',
  service_title: 'Service',
  status: 'open',
  priority: 'medium',
  createdAt: '2026-01-01T00:00:00.000Z',
  scheduledDate: '2026-01-02T00:00:00.000Z',
  notes: '',
}

describe('domain/tickets/display', () => {
  it('uses direct ticket names when provided', () => {
    const ticket: Ticket = {
      ...ticketBase,
      customerName: 'Direct Customer',
      vesselName: 'Direct Vessel',
    }

    expect(resolveTicketCustomerName(ticket, [])).toBe('Direct Customer')
    expect(resolveTicketVesselName(ticket, [])).toBe('Direct Vessel')
  })

  it('falls back to lookup collections and then id', () => {
    const customers: Customer[] = [
      {
        id: 'c-1',
        name: 'Stored Customer',
        phone: '',
        email: '',
        address: '',
        createdAt: '',
      },
    ]

    const vessels: Vessel[] = [
      {
        id: 'v-1',
        customerId: 'c-1',
        customerName: '',
        customerPhone: '',
        vesselName: 'Stored Vessel',
        vesselMake: '',
        vesselYear: 2020,
        hullIdNumber: '',
        numberOfEngines: 1,
        engineSerialNumbers: [],
        generator: false,
        boatLocation: '',
        engineMake: '',
        engineModel: '',
        engineHorsepower: 0,
        engineHours: 0,
      },
    ]

    expect(resolveTicketCustomerName(ticketBase, customers)).toBe('Stored Customer')
    expect(resolveTicketVesselName(ticketBase, vessels)).toBe('Stored Vessel')

    expect(resolveTicketCustomerName({ ...ticketBase, customerId: 'missing' }, [])).toBe('missing')
    expect(resolveTicketVesselName({ ...ticketBase, vesselId: 'missing' }, [])).toBe('missing')
  })
})
