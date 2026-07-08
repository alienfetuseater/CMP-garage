<template>
  <section class="messages-list">
    <h3>Message History</h3>
    <ul class="message-list">
      <li
        v-for="message in sortedMessages"
        :key="message.timestamp + message.sender + message.conversationId"
        class="message-item"
        @click="selectConversation(message.conversationId)"
      >
        <div class="message-header">
          <span class="message-meta">{{ message.timestamp }}</span>
          <span class="message-conversation">{{ message.conversationId }}</span>
        </div>
        <div>
          <span class="message-sender">{{ message.sender }}:</span>
          <span class="message-text">{{ message.text }}</span>
        </div>
      </li>
    </ul>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue'
import type { Conversation } from '@/types/mock'

export default defineComponent({
  emits: ['select-conversation'],
  props: {
    conversations: {
      type: Array as PropType<Conversation[]>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const sortedMessages = computed(() => {
      return props.conversations
        .flatMap((conversation) =>
          conversation.messages.map((message) => ({
            ...message,
            conversationId: conversation.id,
          })),
        )
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    })

    function selectConversation(conversationId: string) {
      const conversation = props.conversations.find((item) => item.id === conversationId)
      if (conversation) {
        emit('select-conversation', conversation)
      }
    }

    return {
      sortedMessages,
      selectConversation,
    }
  },
})
</script>

<style scoped>
.messages-list {
  margin-top: 16px;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #ffffff;
}

.message-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.message-item {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
}

.message-item:hover {
  background: #f3f4f6;
}

.message-item:last-child {
  border-bottom: none;
}

.message-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
  font-size: 0.9rem;
  color: #6b7280;
}

.message-conversation {
  font-weight: 600;
  color: #111827;
}

.message-sender {
  font-weight: 700;
  color: #111827;
}

.message-text {
  margin-left: 6px;
  color: #374151;
}

.messages-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.messages-list li {
  margin-bottom: 8px;
  line-height: 1.4;
}

.message-meta {
  font-weight: 600;
  color: #1f2937;
}

.message-text {
  margin-left: 4px;
  color: #374151;
}
</style>
