import { beforeEach, describe, expect, it, vi } from 'vitest'

const ioMock = vi.fn()
const ticketByIdMock = vi.fn()
const addTicketMock = vi.fn()
const reminderByIdMock = vi.fn()
const addReminderMock = vi.fn()

vi.mock('socket.io-client', () => ({
  io: ioMock,
}))

vi.mock('@/stores/tickets', () => ({
  useTicketStore: () => ({
    ticketById: ticketByIdMock,
    addTicket: addTicketMock,
  }),
}))

vi.mock('@/stores/reminders', () => ({
  useReminderStore: () => ({
    reminderById: reminderByIdMock,
    addReminder: addReminderMock,
  }),
}))

describe('services/realtime/messaging', () => {
  beforeEach(() => {
    vi.resetModules()
    ioMock.mockReset()
    ticketByIdMock.mockReset()
    addTicketMock.mockReset()
    reminderByIdMock.mockReset()
    addReminderMock.mockReset()
  })

  it('returns null when token is empty', async () => {
    const { connectRealtimeMessaging } = await import('./messaging')
    expect(connectRealtimeMessaging('   ')).toBeNull()
    expect(ioMock).not.toHaveBeenCalled()
  })

  it('connects with websocket transport and reuses socket for same token', async () => {
    const handlers: Record<string, (...args: unknown[]) => void> = {}
    const socket = {
      on: vi.fn((event: string, callback: (...args: unknown[]) => void) => {
        handlers[event] = callback
      }),
      disconnect: vi.fn(),
    }
    ioMock.mockReturnValue(socket)

    const { connectRealtimeMessaging, getRealtimeMessagingSocket } = await import('./messaging')

    const first = connectRealtimeMessaging('token-1')
    const second = connectRealtimeMessaging('token-1')

    expect(first).toBe(socket)
    expect(second).toBe(socket)
    expect(getRealtimeMessagingSocket()).toBe(socket)
    expect(ioMock).toHaveBeenCalledTimes(1)
    expect(ioMock).toHaveBeenCalledWith('http://localhost:8000', {
      transports: ['websocket'],
      auth: { token: 'token-1' },
    })
  })

  it('reconnects on token change and syncs ticket updates into store', async () => {
    const oldSocket = {
      on: vi.fn(),
      disconnect: vi.fn(),
    }

    const handlers: Record<string, (...args: unknown[]) => void> = {}
    const newSocket = {
      on: vi.fn((event: string, callback: (...args: unknown[]) => void) => {
        handlers[event] = callback
      }),
      disconnect: vi.fn(),
    }

    ioMock.mockReturnValueOnce(oldSocket).mockReturnValueOnce(newSocket)
    ticketByIdMock.mockReturnValue({ id: 'ticket-1', archivedByUserIds: [], messages: [] })

    const { connectRealtimeMessaging, disconnectRealtimeMessaging } = await import('./messaging')

    connectRealtimeMessaging('token-1')
    connectRealtimeMessaging('token-2')

    expect(oldSocket.disconnect).toHaveBeenCalledTimes(1)

    handlers['conversation:updated']?.({
      type: 'ticket',
      entityId: 'ticket-1',
      archivedByUserIds: ['u-1'],
      messages: [
        {
          id: 'm-1',
          senderId: 'u-2',
          senderName: 'Tech',
          recipientId: 'u-1',
          recipientName: 'Customer',
          text: 'Updated',
          timestamp: '2026-01-01T00:00:00.000Z',
          readByUserIds: [],
        },
      ],
    })

    expect(addTicketMock).toHaveBeenCalledTimes(1)

    disconnectRealtimeMessaging()
    expect(newSocket.disconnect).toHaveBeenCalledTimes(1)
  })
})
