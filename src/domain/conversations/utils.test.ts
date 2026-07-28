import { describe, expect, it } from 'vitest'
import {
  buildConversationSummary,
  countUnreadConversationMessages,
  normalizeConversationMessages,
} from './utils'
import type { Reminder, Ticket } from '@/types/mock'

const baseTicket = (overrides: Partial<Ticket> = {}): Ticket => ({
  id: 'ticket-1',
  customerId: 'customer-1',
  vesselId: 'vessel-1',
  service_category: 'repair',
  service_title: 'Engine service',
  status: 'open',
  priority: 'medium',
  createdAt: '2026-01-01T00:00:00.000Z',
  scheduledDate: '2026-01-02T00:00:00.000Z',
  notes: '',
  ...overrides,
})

const baseReminder = (overrides: Partial<Reminder> = {}): Reminder => ({
  id: 'reminder-1',
  title: 'Call customer',
  completed: false,
  notes: '',
  relatedTo: {
    type: 'ticket',
    id: 'ticket-1',
  },
  ...overrides,
})

describe('domain/conversations/utils', () => {
  it('normalizes, filters, and sorts messages', () => {
    const messages = normalizeConversationMessages([
      {
        _id: 2,
        senderId: 'u-2',
        senderName: 'Tech',
        recipientId: 'u-1',
        recipientName: 'Customer',
        text: 'Second',
        timestamp: '2026-01-02T00:00:00.000Z',
        readByUserIds: [],
      },
      {
        _id: 1,
        senderId: 'u-2',
        senderName: 'Tech',
        recipientId: 'u-1',
        recipientName: 'Customer',
        text: '   ',
        timestamp: '2026-01-01T00:00:00.000Z',
        readByUserIds: [],
      },
      {
        _id: 3,
        sender: 'Legacy Sender',
        senderId: 'u-1',
        recipientId: 'u-2',
        recipientName: 'Tech',
        text: 'First',
        timestamp: '2026-01-01T00:00:00.000Z',
        readByUserIds: [' u-1 '],
      },
    ])

    expect(messages.map((entry) => entry.id)).toEqual(['3', '2'])
    expect(messages[0]?.senderName).toBe('Legacy Sender')
    expect(messages[0]?.readByUserIds).toEqual(['u-1'])
  })

  it('builds summary with unread counts and partner names', () => {
    const record = baseTicket({
      messages: [
        {
          id: 'm-1',
          senderId: 'u-2',
          senderName: 'Tech',
          recipientId: 'u-1',
          recipientName: 'Customer',
          text: 'Hello',
          timestamp: '2026-01-01T00:00:00.000Z',
          readByUserIds: [],
        },
      ],
    })

    const summary = buildConversationSummary('ticket', record, 'u-1')

    expect(summary?.conversationId).toBe('ticket:ticket-1')
    expect(summary?.partnerNames).toEqual(['Tech'])
    expect(summary?.unreadCount).toBe(1)
  })

  it('respects archive mode and handles empty reminder conversation', () => {
    const archived = baseReminder({
      archivedByUserIds: ['u-1'],
      messages: [
        {
          id: 'm-1',
          senderId: 'u-2',
          senderName: 'Tech',
          recipientId: 'u-1',
          recipientName: 'Customer',
          text: 'Hi',
          timestamp: '2026-01-01T00:00:00.000Z',
          readByUserIds: [],
        },
      ],
    })

    const activeSummary = buildConversationSummary('reminder', archived, 'u-1', 'active')
    const archivedSummary = buildConversationSummary('reminder', archived, 'u-1', 'archived')

    expect(activeSummary).toBeNull()
    expect(archivedSummary?.conversationId).toBe('reminder:reminder-1')

    expect(countUnreadConversationMessages(archived.messages ?? [], 'u-1')).toBe(1)
    expect(countUnreadConversationMessages(archived.messages ?? [], '')).toBe(0)
  })
})
