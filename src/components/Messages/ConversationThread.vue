<template>
  <div class="thread-backdrop" @click.self="close">
    <section class="thread-popup">
      <header class="thread-header">
        <div>
          <h3>{{ conversation.id }}</h3>
          <p class="thread-meta">{{ conversation.messages.length }} messages</p>
        </div>
        <button class="close-btn" @click="close">✕</button>
      </header>

      <ul class="thread-list">
        <li
          v-for="message in conversation.messages"
          :key="message.timestamp + message.sender"
          class="thread-message"
        >
          <div class="thread-message-header">
            <span class="thread-message-sender">{{ message.sender }}</span>
            <span class="thread-message-time">{{ message.timestamp }}</span>
          </div>
          <p class="thread-message-text">{{ message.text }}</p>
        </li>
      </ul>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { Conversation } from '@/types/mock'

export default defineComponent({
  props: {
    conversation: {
      type: Object as PropType<Conversation>,
      required: true,
    },
  },
  emits: ['close'],
  setup(_, { emit }) {
    function close() {
      emit('close')
    }

    return {
      close,
    }
  },
})
</script>

<style scoped>
.thread-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.thread-popup {
  width: min(90vw, 520px);
  max-height: 80vh;
  overflow-y: auto;
  background: #ffffff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 22px 40px rgba(15, 23, 42, 0.18);
}

.thread-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
}

.thread-header h3 {
  margin: 0;
}

.thread-meta {
  margin: 4px 0 0;
  color: #6b7280;
  font-size: 0.95rem;
}

.close-btn {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
}

.thread-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.thread-message {
  padding: 14px 0;
  border-bottom: 1px solid #e5e7eb;
}

.thread-message:last-child {
  border-bottom: none;
}

.thread-message-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  color: #374151;
  font-size: 0.95rem;
}

.thread-message-sender {
  font-weight: 700;
}

.thread-message-time {
  color: #6b7280;
}

.thread-message-text {
  margin: 0;
  line-height: 1.6;
  color: #111827;
}
</style>
