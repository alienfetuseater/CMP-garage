import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchReminders, addReminder, reminderById } from './actions'
import type { Reminder } from '@/types/mock'
import type { RemindersState } from './state'
import { apiFetch } from '@/services/http/client'

vi.mock('@/services/http/client', () => ({
  apiFetch: vi.fn(),
}))

const mockedApiFetch = vi.mocked(apiFetch)

const createReminder = (overrides: Partial<Reminder> = {}): Reminder => ({
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

describe('stores/reminders/actions', () => {
  beforeEach(() => {
    mockedApiFetch.mockReset()
  })

  it('fetchReminders normalizes reminder id, related id, notes, and messages', async () => {
    const state: RemindersState = { reminders: [] }

    mockedApiFetch.mockResolvedValue([
      {
        _id: ' reminder-id ',
        title: 'Check dock lines',
        completed: false,
        notes: null,
        relatedTo: {
          type: 'vessel',
          _id: ' vessel-id ',
        },
        archivedByUserIds: [' tech-1 ', '', undefined],
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
            readByUserIds: [' tech-1 '],
          },
        ],
      },
    ] as unknown as Reminder[])

    const result = await fetchReminders(state)

    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe('reminder-id')
    expect(result[0]?.relatedTo.id).toBe('vessel-id')
    expect(result[0]?.notes).toBe('')
    expect(result[0]?.archivedByUserIds).toEqual(['tech-1'])
    expect(result[0]?.messages?.map((entry) => entry.id)).toEqual(['m-1', 'm-2'])
    expect(mockedApiFetch).toHaveBeenCalledWith('/getAllReminders')
  })

  it('addReminder upserts and applies id normalization', () => {
    const state: RemindersState = { reminders: [] }

    addReminder(state, createReminder({ id: ' reminder-1 ' }))
    addReminder(state, createReminder({ id: 'reminder-1', completed: true }))

    expect(state.reminders).toHaveLength(1)
    expect(state.reminders[0]?.completed).toBe(true)
  })

  it('reminderById uses normalized lookup', () => {
    const state: RemindersState = {
      reminders: [createReminder({ id: 'reminder-42' })],
    }

    expect(reminderById(state, ' reminder-42 ')?.id).toBe('reminder-42')
    expect(reminderById(state, 'missing')).toBeNull()
  })
})
