<template>
  <main class="messages-page">
    <div class="messages-shell">
      <button class="back" @click="goBack">← Back</button>

      <section class="messages-card">
        <header class="messages-header">
          <div>
            <p class="eyebrow">Internal Messaging</p>
            <h2>All Team Messages</h2>
            <p class="messages-subtitle">
              All current ticket and reminder conversations in one place.
            </p>
          </div>

          <div class="header-actions">
            <button type="button" class="secondary" @click="openArchivedConversations">
              Archived Conversations
            </button>
          </div>
        </header>

        <div v-if="currentConversations.length" class="messages-list">
          <button
            v-for="conversation in currentConversations"
            :key="conversation.conversationId"
            type="button"
            class="messages-item"
            :class="{ 'messages-item-unread': conversation.hasUnread }"
            @click="openConversation(conversation)"
          >
            <span class="messages-title-row">
              <span class="messages-title">{{ conversation.title }}</span>
              <span v-if="conversation.unreadCount > 0" class="messages-unread-badge">
                {{ conversation.unreadCount }}
              </span>
            </span>
            <span class="messages-meta">
              {{ conversation.subtitle }} ·
              {{ conversation.partnerNames.join(', ') || 'Conversation' }} ·
              {{ formatLocalDateTime(conversation.lastMessageAt) }}
            </span>
            <span class="messages-preview">{{ conversation.lastMessagePreview }}</span>
          </button>
        </div>

        <div v-else class="empty-state">No active internal conversations.</div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useReminderStore } from '@/stores/reminders'
import { useTicketStore } from '@/stores/tickets'
import type { ConversationSummary } from '@/types/mock'
import { formatLocalDateTime } from '@/utils/datetime'
import { buildConversationSummary } from '@/utils/conversations'

const router = useRouter()
const authStore = useAuthStore()
const ticketStore = useTicketStore()
const reminderStore = useReminderStore()

const currentConversations = computed<ConversationSummary[]>(() => {
  const currentUserId = String(authStore.user?.id || '')

  return [
    ...ticketStore.tickets
      .map((ticket) => buildConversationSummary('ticket', ticket, currentUserId, 'active'))
      .filter((entry): entry is ConversationSummary => Boolean(entry)),
    ...reminderStore.reminders
      .map((reminder) => buildConversationSummary('reminder', reminder, currentUserId, 'active'))
      .filter((entry): entry is ConversationSummary => Boolean(entry)),
  ].sort(
    (left, right) =>
      Number(right.hasUnread) - Number(left.hasUnread) ||
      new Date(right.lastMessageAt || 0).getTime() - new Date(left.lastMessageAt || 0).getTime(),
  )
})

function goBack() {
  router.back()
}

function openConversation(conversation: ConversationSummary) {
  router.push({
    name: 'Conversation',
    query: { type: conversation.type, id: conversation.entityId },
  })
}

function openArchivedConversations() {
  router.push({ name: 'ArchivedMessages' })
}
</script>

<style scoped>
.messages-page {
  min-height: calc(100vh - 24px);
  padding: 24px 16px 40px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.messages-shell {
  width: min(100%, 980px);
}

.messages-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
  padding: 24px;
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

.messages-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.eyebrow {
  margin: 0 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  color: #64748b;
}

.messages-header h2 {
  margin: 0;
  font-size: 2rem;
  line-height: 1.1;
  color: #0f172a;
}

.messages-subtitle {
  margin: 8px 0 0;
  color: #475569;
  font-weight: 600;
}

.header-actions {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.messages-list {
  margin-top: 24px;
  display: grid;
  gap: 12px;
}

.messages-item {
  display: grid;
  gap: 6px;
  width: 100%;
  border: 1px solid #dbeafe;
  border-radius: 14px;
  background: #f8fbff;
  padding: 16px;
  text-align: left;
  cursor: pointer;
  color: #0f172a;
}

.messages-item-unread {
  border-color: #bfdbfe;
  background: #eff6ff;
}

.messages-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.messages-title {
  font-weight: 700;
}

.messages-unread-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 0.78rem;
  font-weight: 700;
}

.messages-meta,
.messages-preview,
.empty-state {
  color: #64748b;
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

@media (max-width: 720px) {
  .messages-page {
    padding: 16px 12px 32px;
  }

  .messages-card {
    padding: 18px;
  }

  .messages-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
