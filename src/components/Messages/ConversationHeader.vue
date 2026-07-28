<template>
  <header class="conversation-header">
    <div>
      <p class="eyebrow">Internal {{ conversation.type }} conversation</p>
      <h2>{{ conversation.title }}</h2>
      <p class="conversation-subtitle">{{ conversation.subtitle }}</p>
    </div>

    <div class="header-actions">
      <button type="button" class="secondary" @click="$emit('open-source-record')">
        Open {{ conversation.type }}
      </button>
      <button type="button" class="secondary" :disabled="archiving" @click="$emit('archive-conversation')">
        Archive Conversation
      </button>
      <button type="button" class="secondary danger" :disabled="deleting" @click="$emit('delete-conversation')">
        Delete Conversation
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { ConversationRecord } from '@/types/mock'

defineProps<{
  conversation: ConversationRecord
  archiving: boolean
  deleting: boolean
}>()

defineEmits<{
  (event: 'open-source-record'): void
  (event: 'archive-conversation'): void
  (event: 'delete-conversation'): void
}>()
</script>

<style scoped>
.conversation-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 18px;
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
  color: #64748b;
}

.header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.secondary {
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #0f172a;
  border-radius: 999px;
  padding: 0.7rem 0.9rem;
  font-weight: 700;
  cursor: pointer;
}

.secondary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.danger {
  color: #b91c1c;
  border-color: #fecaca;
}

@media (max-width: 900px) {
  .conversation-header {
    flex-direction: column;
  }

  .header-actions {
    justify-content: flex-start;
  }
}
</style>
