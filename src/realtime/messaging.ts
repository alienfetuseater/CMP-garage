import { io, type Socket } from 'socket.io-client'
import { API_BASE } from '@/api'
import { useReminderStore } from '@/stores/reminders'
import { useTicketStore } from '@/stores/tickets'
import type { ConversationRecord, Reminder, Ticket } from '@/types/mock'
import { normalizeConversationMessages } from '@/utils/conversations'

let socket: Socket | null = null

const normalizeText = (value: unknown) => String(value ?? '').trim()

const toSocketOrigin = () => {
  return API_BASE.replace(/\/api\/CMPGarage\/?$/, '')
}

const syncConversationIntoStores = (conversation: ConversationRecord) => {
  const ticketStore = useTicketStore()
  const reminderStore = useReminderStore()
  const normalizedMessages = normalizeConversationMessages(conversation.messages)

  if (conversation.type === 'ticket') {
    const existing = ticketStore.ticketById(conversation.entityId)
    if (!existing) return

    ticketStore.addTicket({
      ...(existing as Ticket),
      archivedByUserIds: Array.isArray(conversation.archivedByUserIds)
        ? conversation.archivedByUserIds
        : (existing.archivedByUserIds ?? []),
      messages: normalizedMessages,
    })
    return
  }

  const existing = reminderStore.reminderById(conversation.entityId)
  if (!existing) return

  reminderStore.addReminder({
    ...(existing as Reminder),
    archivedByUserIds: Array.isArray(conversation.archivedByUserIds)
      ? conversation.archivedByUserIds
      : (existing.archivedByUserIds ?? []),
    messages: normalizedMessages,
  })
}

export const connectRealtimeMessaging = (token: string) => {
  const normalizedToken = normalizeText(token)
  if (!normalizedToken) return null

  if (socket) {
    const activeToken = normalizeText(socket.io.opts.auth?.token)
    if (activeToken === normalizedToken) return socket
    socket.disconnect()
    socket = null
  }

  socket = io(toSocketOrigin(), {
    transports: ['websocket'],
    auth: { token: normalizedToken },
  })

  socket.on('conversation:updated', (conversation: ConversationRecord) => {
    if (!conversation?.type || !conversation?.entityId) return
    syncConversationIntoStores({
      ...conversation,
      messages: normalizeConversationMessages(conversation.messages),
    })
  })

  return socket
}

export const disconnectRealtimeMessaging = () => {
  if (!socket) return
  socket.disconnect()
  socket = null
}

export const getRealtimeMessagingSocket = () => socket
