<template>
  <main class="conversation-page">
    <div class="conversation-shell">
      <button class="back" @click="goBack">← Back</button>

      <div v-if="loading" class="status-card">Loading conversation...</div>
      <div v-else-if="error" class="status-card error">{{ error }}</div>

      <section v-else-if="conversation" class="conversation-card">
        <header class="conversation-header">
          <div>
            <p class="eyebrow">Internal {{ conversation.type }} conversation</p>
            <h2>{{ conversation.title }}</h2>
            <p class="conversation-subtitle">{{ conversation.subtitle }}</p>
          </div>

          <div class="header-actions">
            <button type="button" class="secondary" @click="openSourceRecord">
              Open {{ conversation.type }}
            </button>
            <button
              type="button"
              class="secondary"
              :disabled="archiving"
              @click="archiveConversation"
            >
              Archive Conversation
            </button>
            <button
              type="button"
              class="secondary danger"
              :disabled="deleting"
              @click="deleteConversation"
            >
              Delete Conversation
            </button>
          </div>
        </header>

        <section class="message-thread-section">
          <div class="section-heading">
            <h3>Conversation</h3>
            <span>
              {{ conversation.messages.length }} messages
              <strong v-if="unreadCount > 0" class="unread-pill">{{ unreadCount }} unread</strong>
            </span>
          </div>

          <div v-if="conversation.messages.length" class="message-thread">
            <article
              v-for="entry in conversation.messages"
              :key="entry.id"
              class="message-bubble"
              :class="entry.senderId === currentUserId ? 'outbound' : 'inbound'"
            >
              <div class="message-meta">
                <strong>{{ entry.senderName }}</strong>
                <span>{{ formatLocalDateTime(entry.timestamp) }}</span>
                <button
                  type="button"
                  class="message-delete"
                  :disabled="deletingMessageId === entry.id"
                  @click="deleteSingleMessage(entry.id)"
                >
                  {{ deletingMessageId === entry.id ? 'Deleting...' : 'Delete' }}
                </button>
              </div>
              <p>{{ entry.text }}</p>
            </article>
          </div>
          <div v-else class="empty-state">No messages yet for this {{ conversation.type }}.</div>
        </section>

        <section class="composer-section">
          <div class="section-heading">
            <h3>New Internal Message</h3>
          </div>

          <label>
            Message
            <textarea
              v-model="draftMessage"
              rows="6"
              placeholder="Write an internal message about this ticket or reminder"
            ></textarea>
          </label>

          <div class="actions">
            <button
              type="button"
              class="primary"
              :disabled="sending || !draftMessage.trim()"
              @click="sendMessage"
            >
              Send Message
            </button>
            <span v-if="sending">Sending...</span>
            <span v-if="success" class="success">{{ success }}</span>
            <span v-if="sendError" class="error">{{ sendError }}</span>
          </div>
        </section>
      </section>

      <div v-else class="status-card">Conversation not found.</div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiFetch } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useReminderStore } from '@/stores/reminders'
import { useTicketStore } from '@/stores/tickets'
import type { ConversationRecord, ConversationType, Reminder, Ticket } from '@/types/mock'
import { formatLocalDateTime } from '@/utils/datetime'
import {
  countUnreadConversationMessages,
  normalizeConversationMessages,
} from '@/utils/conversations'

const authStore = useAuthStore()
const reminderStore = useReminderStore()
const ticketStore = useTicketStore()
const route = useRoute()
const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const conversation = ref<ConversationRecord | null>(null)
const draftMessage = ref('')
const sending = ref(false)
const archiving = ref(false)
const deleting = ref(false)
const deletingMessageId = ref('')
const sendError = ref<string | null>(null)
const success = ref<string | null>(null)

const currentUserId = computed(() => String(authStore.user?.id || ''))
const unreadCount = computed(() =>
  countUnreadConversationMessages(conversation.value?.messages ?? [], currentUserId.value),
)

const storeConversation = computed(() => {
  const type = getConversationType()
  const id = getConversationId()
  if (!type || !id) return null

  if (type === 'ticket') {
    const ticket = ticketStore.ticketById(id)
    if (!ticket) return null

    return {
      conversationId: `ticket:${ticket.id}`,
      type: 'ticket' as const,
      entityId: ticket.id,
      title: ticket.service_title,
      subtitle: `${ticket.service_category} • ${ticket.status}`,
      sourceRouteName: 'Ticket' as const,
      archivedByUserIds: ticket.archivedByUserIds ?? [],
      messages: normalizeConversationMessages(ticket.messages),
    }
  }

  const reminder = reminderStore.reminderById(id)
  if (!reminder) return null

  return {
    conversationId: `reminder:${reminder.id}`,
    type: 'reminder' as const,
    entityId: reminder.id,
    title: reminder.title,
    subtitle: `${reminder.relatedTo?.type || 'reminder'} • ${reminder.completed ? 'completed' : 'open'}`,
    sourceRouteName: 'Reminder' as const,
    archivedByUserIds: reminder.archivedByUserIds ?? [],
    messages: normalizeConversationMessages(reminder.messages),
  }
})

function getConversationType(): ConversationType | null {
  const type = String(route.query.type || '')
    .trim()
    .toLowerCase()
  if (type === 'ticket' || type === 'reminder') return type
  return null
}

function getConversationId() {
  return String(route.query.id || '').trim()
}

function syncConversationIntoStores(nextConversation: ConversationRecord) {
  if (nextConversation.type === 'ticket') {
    const existing = ticketStore.ticketById(nextConversation.entityId)
    if (existing) {
      ticketStore.addTicket({
        ...existing,
        archivedByUserIds: nextConversation.archivedByUserIds ?? existing.archivedByUserIds ?? [],
        messages: normalizeConversationMessages(nextConversation.messages),
      })
    }
    return
  }

  const existing = reminderStore.reminderById(nextConversation.entityId)
  if (existing) {
    reminderStore.addReminder({
      ...existing,
      archivedByUserIds: nextConversation.archivedByUserIds ?? existing.archivedByUserIds ?? [],
      messages: normalizeConversationMessages(nextConversation.messages),
    })
  }
}

async function load() {
  loading.value = true
  error.value = null
  success.value = null
  sendError.value = null

  try {
    const type = getConversationType()
    const id = getConversationId()

    if (!type || !id) {
      throw new Error('Conversation type and id are required')
    }

    const conversationResponse = await apiFetch<ConversationRecord>(
      `/conversations/${encodeURIComponent(type)}/${encodeURIComponent(id)}`,
    )

    const normalizedConversation: ConversationRecord = {
      ...conversationResponse,
      messages: normalizeConversationMessages(conversationResponse.messages),
    }

    conversation.value = normalizedConversation
    syncConversationIntoStores(normalizedConversation)
    void markAsRead(normalizedConversation)
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

async function markAsRead(targetConversation = conversation.value) {
  if (!targetConversation) return

  const unreadMessages = countUnreadConversationMessages(
    targetConversation.messages,
    currentUserId.value,
  )

  if (!unreadMessages) return

  try {
    const response = await apiFetch<ConversationRecord>(
      `/conversations/${encodeURIComponent(targetConversation.type)}/${encodeURIComponent(targetConversation.entityId)}/read`,
      {
        method: 'POST',
      },
    )

    const normalizedConversation: ConversationRecord = {
      ...response,
      messages: normalizeConversationMessages(response.messages),
    }

    conversation.value = normalizedConversation
    syncConversationIntoStores(normalizedConversation)
  } catch {
    // Non-blocking: leave the thread visible even if read status sync fails.
  }
}

function goBack() {
  router.back()
}

function openSourceRecord() {
  if (!conversation.value) return

  router.push({
    name: conversation.value.sourceRouteName,
    query: { id: conversation.value.entityId },
  })
}

async function sendMessage() {
  if (!conversation.value) return

  sending.value = true

  async function archiveConversation() {
    if (!conversation.value || archiving.value) return

    archiving.value = true
    sendError.value = null
    success.value = null

    try {
      await apiFetch<{ archived: boolean }>(
        `/conversations/${encodeURIComponent(conversation.value.type)}/${encodeURIComponent(conversation.value.entityId)}/archive`,
        { method: 'POST' },
      )

      if (conversation.value.type === 'ticket') {
        const existing = ticketStore.ticketById(conversation.value.entityId)
        if (existing) {
          ticketStore.addTicket({
            ...existing,
            archivedByUserIds: Array.from(
              new Set([...(existing.archivedByUserIds ?? []), currentUserId.value].filter(Boolean)),
            ),
          })
        }
      } else {
        const existing = reminderStore.reminderById(conversation.value.entityId)
        if (existing) {
          reminderStore.addReminder({
            ...existing,
            archivedByUserIds: Array.from(
              new Set([...(existing.archivedByUserIds ?? []), currentUserId.value].filter(Boolean)),
            ),
          })
        }
      }

      router.push({
        name: conversation.value.sourceRouteName,
        query: { id: conversation.value.entityId },
      })
    } catch (err) {
      sendError.value = err instanceof Error ? err.message : String(err)
    } finally {
      archiving.value = false
    }
  }

  async function deleteSingleMessage(messageId: string) {
    if (!conversation.value || !messageId || deletingMessageId.value) return
    if (!window.confirm('Delete this message from the conversation?')) {
      return
    }

    deletingMessageId.value = messageId
    sendError.value = null
    success.value = null

    try {
      const response = await apiFetch<{ conversation: ConversationRecord }>(
        `/conversations/${encodeURIComponent(conversation.value.type)}/${encodeURIComponent(conversation.value.entityId)}/messages/${encodeURIComponent(messageId)}`,
        {
          method: 'DELETE',
        },
      )

      const normalizedConversation: ConversationRecord = {
        ...response.conversation,
        messages: normalizeConversationMessages(response.conversation.messages),
      }

      conversation.value = normalizedConversation
      syncConversationIntoStores(normalizedConversation)

      if (!normalizedConversation.messages.length) {
        router.push({
          name: normalizedConversation.sourceRouteName,
          query: { id: normalizedConversation.entityId },
        })
        return
      }

      success.value = 'Message deleted'
    } catch (err) {
      sendError.value = err instanceof Error ? err.message : String(err)
    } finally {
      deletingMessageId.value = ''
    }
  }

  async function deleteConversation() {
    if (!conversation.value || deleting.value) return
    if (
      !window.confirm(
        'Delete this conversation and clear all messages for everyone on this thread?',
      )
    ) {
      return
    }

    deleting.value = true
    sendError.value = null
    success.value = null

    try {
      await apiFetch<{ deleted: boolean }>(
        `/conversations/${encodeURIComponent(conversation.value.type)}/${encodeURIComponent(conversation.value.entityId)}`,
        { method: 'DELETE' },
      )

      if (conversation.value.type === 'ticket') {
        const existing = ticketStore.ticketById(conversation.value.entityId)
        if (existing) {
          ticketStore.addTicket({
            ...existing,
            messages: [],
            archivedByUserIds: [],
          })
        }
      } else {
        const existing = reminderStore.reminderById(conversation.value.entityId)
        if (existing) {
          reminderStore.addReminder({
            ...existing,
            messages: [],
            archivedByUserIds: [],
          })
        }
      }

      router.push({
        name: conversation.value.sourceRouteName,
        query: { id: conversation.value.entityId },
      })
    } catch (err) {
      sendError.value = err instanceof Error ? err.message : String(err)
    } finally {
      deleting.value = false
    }
  }
  sendError.value = null
  success.value = null

  try {
    const response = await apiFetch<{ conversation: ConversationRecord }>(
      `/conversations/${encodeURIComponent(conversation.value.type)}/${encodeURIComponent(conversation.value.entityId)}/messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: draftMessage.value,
        }),
      },
    )

    const normalizedConversation: ConversationRecord = {
      ...response.conversation,
      messages: normalizeConversationMessages(response.conversation.messages),
    }

    conversation.value = normalizedConversation
    syncConversationIntoStores(normalizedConversation)
    draftMessage.value = ''
    success.value = 'Message sent'
  } catch (err) {
    sendError.value = err instanceof Error ? err.message : String(err)
  } finally {
    sending.value = false
  }
}

watch(
  () => route.fullPath,
  () => {
    void load()
  },
  { immediate: true },
)

watch(
  storeConversation,
  (nextConversation) => {
    if (!nextConversation) return

    conversation.value = {
      ...nextConversation,
      messages: normalizeConversationMessages(nextConversation.messages),
    }

    void markAsRead(conversation.value)
  },
  { deep: true },
)
</script>

<style scoped>
.conversation-page {
  min-height: calc(100vh - 24px);
  padding: 24px 16px 40px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.conversation-shell {
  width: min(100%, 980px);
  position: relative;
}

.conversation-card,
.status-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
  padding: 24px;
}

.status-card {
  text-align: center;
  color: #334155;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  color: var(--color-ocean-dark);
  cursor: pointer;
  margin-bottom: 16px;
  padding: 0;
  font-weight: 600;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  color: #64748b;
}

.conversation-header h2 {
  margin: 0;
  font-size: 2rem;
  line-height: 1.1;
  color: #0f172a;
}

.conversation-subtitle {
  margin: 8px 0 0;
  color: #475569;
  font-weight: 600;
}

.header-actions,
.actions {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.message-thread-section,
.composer-section {
  margin-top: 24px;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.section-heading h3 {
  margin: 0;
  color: #0f172a;
}

.message-thread {
  display: grid;
  gap: 12px;
}

.message-bubble {
  max-width: min(100%, 720px);
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid #dbeafe;
  background: #f8fbff;
  color: #0f172a;
}

.message-bubble.outbound {
  margin-left: auto;
  background: #dbeafe;
  border-color: #bfdbfe;
}

.message-bubble.inbound {
  margin-right: auto;
}

.message-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
  color: #475569;
  font-size: 0.9rem;
}

.message-delete {
  margin-left: auto;
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.message-delete:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.message-bubble p {
  margin: 0;
  white-space: pre-wrap;
}

label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #334155;
  font-weight: 600;
  margin-top: 12px;
}

select,
textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 12px 14px;
  font: inherit;
  background: #ffffff;
  color: #0f172a;
}

textarea {
  resize: vertical;
}

.primary {
  border: 1px solid var(--color-ocean-deep);
  background: var(--color-ocean-dark);
  color: #ffffff;
  border-radius: 12px;
  padding: 10px 14px;
  font-weight: 700;
  cursor: pointer;
}

.secondary {
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 12px;
  padding: 10px 14px;
  font-weight: 700;
  cursor: pointer;
}

.secondary.danger {
  border-color: #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.empty-state {
  color: #64748b;
}

.error {
  color: #b91c1c;
}

.success {
  color: #059669;
}

.unread-pill {
  display: inline-flex;
  margin-left: 10px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 0.8rem;
}

@media (max-width: 720px) {
  .conversation-page {
    padding: 16px 12px 32px;
  }

  .conversation-card,
  .status-card {
    padding: 18px;
  }

  .conversation-header,
  .section-heading {
    flex-direction: column;
    align-items: flex-start;
  }

  .message-bubble {
    max-width: 100%;
  }
}
</style>
