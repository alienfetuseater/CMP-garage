import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fetchTickets, addTicket, ticketById } from './actions'
import type { Ticket } from '@/types/mock'
import type { TicketsState } from './state'
import { apiFetch } from '@/services/http/client'

vi.mock('@/services/http/client', () => ({
  apiFetch: vi.fn(),
}))

const mockedApiFetch = vi.mocked(apiFetch)

const createTicket = (overrides: Partial<Ticket> = {}): Ticket => ({
  id: 'ticket-1',
  customerId: 'customer-1',
  vesselId: 'vessel-1',
  service_category: 'repair',
  service_title: 'Engine check',
  status: 'open',
  priority: 'medium',
  createdAt: '2026-01-01T00:00:00.000Z',
  scheduledDate: '2026-01-03T00:00:00.000Z',
  notes: '',
  ...overrides,
})

describe('stores/tickets/actions', () => {
  beforeEach(() => {
    mockedApiFetch.mockReset()
  })

  it('fetchTickets normalizes ids, archive lists, and message ordering', async () => {
    const state: TicketsState = { tickets: [] }

    mockedApiFetch.mockResolvedValue([
      {
        _id: ' raw-id ',
        customerId: 'customer-1',
        vesselId: 'vessel-1',
        service_category: 'repair',
        service_title: 'Engine check',
        status: 'open',
        priority: 'medium',
        createdAt: '2026-01-01T00:00:00.000Z',
        scheduledDate: '2026-01-03T00:00:00.000Z',
        notes: '',
        archivedByUserIds: [' user-a ', '', null],
        messages: [
          {
            id: 'm-2',
            senderId: 'tech-2',
            senderName: 'Tech Two',
            recipientId: 'customer-1',
            recipientName: 'Customer',
            text: 'Second',
            timestamp: '2026-01-02T00:00:00.000Z',
            readByUserIds: [],
          },
          {
            id: 'm-empty',
            senderId: 'tech-2',
            senderName: 'Tech Two',
            recipientId: 'customer-1',
            recipientName: 'Customer',
            text: '   ',
            timestamp: '2026-01-01T00:00:00.000Z',
            readByUserIds: [],
          },
          {
            id: 'm-1',
            senderId: 'tech-1',
            senderName: 'Tech One',
            recipientId: 'customer-1',
            recipientName: 'Customer',
            text: 'First',
            timestamp: '2026-01-01T00:00:00.000Z',
            readByUserIds: [' user-a '],
          },
        ],
      },
    ] as unknown as Ticket[])

    const result = await fetchTickets(state)

    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe('raw-id')
    expect(result[0]?.archivedByUserIds).toEqual(['user-a'])
    expect(result[0]?.messages?.map((entry) => entry.id)).toEqual(['m-1', 'm-2'])
    expect(mockedApiFetch).toHaveBeenCalledWith('/getAllTickets')
  })

  it('addTicket upserts by normalized id', () => {
    const state: TicketsState = { tickets: [] }

    addTicket(state, createTicket({ id: ' ticket-1 ' }))
    addTicket(state, createTicket({ id: 'ticket-1', status: 'completed' }))

    expect(state.tickets).toHaveLength(1)
    expect(state.tickets[0]?.status).toBe('completed')
  })

  it('ticketById uses normalized lookup', () => {
    const state: TicketsState = {
      tickets: [createTicket({ id: 'ticket-42' })],
    }

    expect(ticketById(state, ' ticket-42 ')?.id).toBe('ticket-42')
    expect(ticketById(state, 'missing')).toBeNull()
  })
})
