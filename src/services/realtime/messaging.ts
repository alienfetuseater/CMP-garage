import { io, type Socket } from 'socket.io-client'
import { API_BASE } from '@/services/http/client'
import { useReminderStore } from '@/stores/reminders'
import { useTicketStore } from '@/stores/tickets'
import type { ConversationRecord, Reminder, Ticket } from '@/types/mock'
import { normalizeConversationMessages, toNormalizedText } from '@/domain/conversations/utils'

let socket: Socket | null = null
let activeSocketToken = ''

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
  const normalizedToken = toNormalizedText(token)
  if (!normalizedToken) return null

  if (socket) {
    if (activeSocketToken === normalizedToken) return socket
    socket.disconnect()
    socket = null
    activeSocketToken = ''
  }

  socket = io(toSocketOrigin(), {
    transports: ['websocket'],
    auth: { token: normalizedToken },
  })
  activeSocketToken = normalizedToken

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
  activeSocketToken = ''
}

export const getRealtimeMessagingSocket = () => socket
