import type {
  ConversationMessage,
  ConversationSummary,
  ConversationType,
  Reminder,
  Ticket,
} from '@/types/mock'

type RawConversationMessage = Partial<ConversationMessage> & {
  sender?: string
  _id?: string
}

const normalizeText = (value: unknown) => String(value ?? '').trim()

export const normalizeConversationMessage = (
  value: RawConversationMessage,
): ConversationMessage => ({
  id: normalizeText(value.id ?? value._id),
  senderId: normalizeText(value.senderId),
  senderName: normalizeText(value.senderName ?? value.sender) || 'Unknown user',
  recipientId: normalizeText(value.recipientId),
  recipientName: normalizeText(value.recipientName),
  text: normalizeText(value.text),
  timestamp: normalizeText(value.timestamp),
  readByUserIds: Array.isArray(value.readByUserIds)
    ? value.readByUserIds.map((entry) => normalizeText(entry)).filter(Boolean)
    : [],
})

export const normalizeConversationMessages = (value: unknown): ConversationMessage[] => {
  if (!Array.isArray(value)) return []

  return value
    .map((entry) => normalizeConversationMessage(entry as RawConversationMessage))
    .filter((entry) => entry.text)
    .sort(
      (left, right) =>
        new Date(left.timestamp || 0).getTime() - new Date(right.timestamp || 0).getTime(),
    )
}

const buildConversationTitle = (type: ConversationType, record: Ticket | Reminder) => {
  return type === 'ticket'
    ? normalizeText((record as Ticket).service_title) || 'Untitled ticket'
    : normalizeText((record as Reminder).title) || 'Untitled reminder'
}

const buildConversationSubtitle = (type: ConversationType, record: Ticket | Reminder) => {
  if (type === 'ticket') {
    const ticket = record as Ticket
    return `${normalizeText(ticket.service_category) || 'service'} • ${normalizeText(ticket.status) || 'N/A'}`
  }

  const reminder = record as Reminder
  return `${normalizeText(reminder.relatedTo?.type) || 'reminder'} • ${reminder.completed ? 'completed' : 'open'}`
}

export const buildConversationSummary = (
  type: ConversationType,
  record: Ticket | Reminder,
  currentUserId = '',
  archiveMode: 'active' | 'archived' | 'all' = 'active',
): ConversationSummary | null => {
  const archivedByUserIds = Array.isArray(record.archivedByUserIds)
    ? record.archivedByUserIds.map((entry) => normalizeText(entry)).filter(Boolean)
    : []
  const isArchivedForUser = currentUserId ? archivedByUserIds.includes(currentUserId) : false

  if (archiveMode === 'active' && isArchivedForUser) {
    return null
  }

  if (archiveMode === 'archived' && !isArchivedForUser) {
    return null
  }

  const messages = normalizeConversationMessages(record.messages)
  if (!messages.length) return null

  const lastMessage = messages[messages.length - 1]
  const otherPartyNames = new Set<string>()

  for (const entry of messages) {
    if (entry.senderName && entry.senderId !== currentUserId) {
      otherPartyNames.add(entry.senderName)
    }
  }

  const unreadCount = currentUserId
    ? messages.filter(
        (entry) => entry.senderId !== currentUserId && !entry.readByUserIds.includes(currentUserId),
      ).length
    : 0

  return {
    conversationId: `${type}:${record.id}`,
    type,
    entityId: record.id,
    title: buildConversationTitle(type, record),
    subtitle: buildConversationSubtitle(type, record),
    sourceRouteName: type === 'ticket' ? 'Ticket' : 'Reminder',
    partnerNames: Array.from(otherPartyNames),
    lastMessageAt: lastMessage.timestamp,
    lastMessagePreview: lastMessage.text.slice(0, 140),
    messageCount: messages.length,
    unreadCount,
    hasUnread: unreadCount > 0,
  }
}

export const countUnreadConversationMessages = (
  messages: ConversationMessage[],
  currentUserId: string,
) => {
  if (!currentUserId) return 0

  return messages.filter(
    (entry) => entry.senderId !== currentUserId && !entry.readByUserIds.includes(currentUserId),
  ).length
}
