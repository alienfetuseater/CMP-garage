<template>
  <section class="reminder-list-panel">
    <h3>reminder List</h3>
    <ul>
      <li
        v-for="reminder in reminders"
        :key="reminder.id"
        :class="[{ completed: reminder.completed }, reminder.type]"
        @click="selectreminder(reminder)"
      >
        <div class="reminder-title">{{ reminder.title }}</div>
        <div class="reminder-meta">
          <span>{{ reminder.date }}</span>
          <span>{{ reminder.status }}</span>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { ReminderDisplayItem } from '@/types/mock'

defineProps({
  reminders: {
    type: Array as PropType<ReminderDisplayItem[]>,
    required: true,
  },
})

const emit = defineEmits(['select-reminder'])

function selectreminder(reminder: ReminderDisplayItem) {
  emit('select-reminder', reminder)
}
</script>

<style scoped>
.reminder-list-panel {
  margin-top: 16px;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #ffffff;
}

.reminder-list-panel h3 {
  margin-top: 0;
}

.reminder-list-panel ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.reminder-list-panel li {
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
}

.reminder-list-panel li:last-child {
  border-bottom: none;
}

.reminder-title {
  font-weight: 600;
}

.reminder-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
}

.completed .reminder-title {
  text-decoration: line-through;
  color: #6b7280;
}
</style>
