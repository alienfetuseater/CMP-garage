<template>
  <section class="ticket-list-panel">
    <h3>ticket List</h3>
    <ul>
      <li
        v-for="ticket in tickets"
        :key="ticket.id"
        :class="[{ completed: ticket.completed }, ticket.type]"
        @click="selectTicket(ticket)"
      >
        <div class="ticket-title">{{ ticket.title }}</div>
        <div class="ticket-meta">
          <span>{{ ticket.date }}</span>
          <span>{{ ticket.status }}</span>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { ReminderDisplayItem } from '@/types/mock'

defineProps({
  tickets: {
    type: Array as PropType<ReminderDisplayItem[]>,
    required: true,
  },
})

const emit = defineEmits(['select-ticket'])

function selectTicket(ticket: ReminderDisplayItem) {
  emit('select-ticket', ticket)
}
</script>

<style scoped>
.ticket-list-panel {
  margin-top: 16px;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #ffffff;
}

.ticket-list-panel h3 {
  margin-top: 0;
}

.ticket-list-panel ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.ticket-list-panel li {
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
}

.ticket-list-panel li:last-child {
  border-bottom: none;
}

.ticket-title {
  font-weight: 600;
}

.ticket-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
}

.completed .ticket-title {
  text-decoration: line-through;
  color: #6b7280;
}
</style>
