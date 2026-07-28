<template>
  <section class="message-thread-section">
    <div class="section-heading">
      <h3>Conversation</h3>
      <span>
        {{ messages.length }} messages
        <strong v-if="unreadCount > 0" class="unread-pill">{{ unreadCount }} unread</strong>
      </span>
    </div>

    <div v-if="messages.length" class="message-thread">
      <article
        v-for="entry in messages"
        :key="entry.id"
        class="message-bubble"
        :class="entry.senderId === currentUserId ? 'outbound' : 'inbound'"
      >
        <div class="message-meta">
          <strong>{{ entry.senderName }}</strong>
          <span>{{ formatDate(entry.timestamp) }}</span>
          <button
            type="button"
            class="message-delete"
            :disabled="deletingMessageId === entry.id"
            @click="$emit('delete-message', entry.id)"
          >
            {{ deletingMessageId === entry.id ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
        <p>{{ entry.text }}</p>
      </article>
    </div>
    <div v-else class="empty-state">No messages yet for this {{ messageType }}.</div>
  </section>
</template>

<script setup lang="ts">
import type { ConversationMessage, ConversationType } from '@/types/mock'
import { formatLocalDateTime } from '@/shared/datetime/format'

defineProps<{
  messages: ConversationMessage[]
  currentUserId: string
  deletingMessageId: string
  unreadCount: number
  messageType: ConversationType
}>()

defineEmits<{
  (event: 'delete-message', id: string): void
}>()

function formatDate(value: string) {
  return formatLocalDateTime(value)
}
</script>

<style scoped>
.message-thread-section {
  display: grid;
  gap: 12px;
  margin-bottom: 18px;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.section-heading h3 {
  margin: 0;
  color: #0f172a;
}

.unread-pill {
  margin-left: 6px;
  color: #2563eb;
}

.message-thread {
  display: grid;
  gap: 10px;
}

.message-bubble {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px 14px;
  background: #f8fafc;
}

.message-bubble.outbound {
  background: #eff6ff;
}

.message-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
  color: #64748b;
  font-size: 0.95rem;
}

.message-delete {
  border: none;
  background: transparent;
  color: #2563eb;
  cursor: pointer;
}

.message-delete:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.empty-state {
  padding: 16px;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  color: #475569;
  background: #f8fafc;
  text-align: center;
}
</style>
