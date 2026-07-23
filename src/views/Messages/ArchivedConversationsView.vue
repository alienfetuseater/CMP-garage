<template>
  <main class="archived-page">
    <div class="archived-shell">
      <button class="back" @click="goBack">← Back</button>

      <section class="archived-card">
        <header class="archived-header">
          <div>
            <p class="eyebrow">Internal Messaging</p>
            <h2>Archived Conversations</h2>
            <p class="archived-subtitle">
              Conversations hidden from your active Team Messages list.
            </p>
          </div>
        </header>

        <div v-if="archivedConversations.length" class="archived-list">
          <button
            v-for="conversation in archivedConversations"
            :key="conversation.conversationId"
            type="button"
            class="archived-item"
            @click="openConversation(conversation)"
          >
            <span class="archived-title">{{ conversation.title }}</span>
            <span class="archived-meta">
              {{ conversation.subtitle }} ·
              {{ conversation.partnerNames.join(', ') || 'Conversation' }} ·
              {{ formatLocalDateTime(conversation.lastMessageAt) }}
            </span>
            <span class="archived-preview">{{ conversation.lastMessagePreview }}</span>
          </button>
        </div>

        <div v-else class="empty-state">No archived conversations.</div>
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

const archivedConversations = computed<ConversationSummary[]>(() => {
  const currentUserId = String(authStore.user?.id || '')

  return [
    ...ticketStore.tickets
      .map((ticket) => buildConversationSummary('ticket', ticket, currentUserId, 'archived'))
      .filter((entry): entry is ConversationSummary => Boolean(entry)),
    ...reminderStore.reminders
      .map((reminder) => buildConversationSummary('reminder', reminder, currentUserId, 'archived'))
      .filter((entry): entry is ConversationSummary => Boolean(entry)),
  ].sort(
    (left, right) =>
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
</script>

<style scoped>
.archived-page {
  min-height: calc(100vh - 24px);
  padding: 24px 16px 40px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.archived-shell {
  width: min(100%, 980px);
}

.archived-card {
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

.eyebrow {
  margin: 0 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  color: #64748b;
}

.archived-header h2 {
  margin: 0;
  font-size: 2rem;
  line-height: 1.1;
  color: #0f172a;
}

.archived-subtitle {
  margin: 8px 0 0;
  color: #475569;
  font-weight: 600;
}

.archived-list {
  margin-top: 24px;
  display: grid;
  gap: 12px;
}

.archived-item {
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

.archived-title {
  font-weight: 700;
}

.archived-meta,
.archived-preview,
.empty-state {
  color: #64748b;
}

@media (max-width: 720px) {
  .archived-page {
    padding: 16px 12px 32px;
  }

  .archived-card {
    padding: 18px;
  }
}
</style>
