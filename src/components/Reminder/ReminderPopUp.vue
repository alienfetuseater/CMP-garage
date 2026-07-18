<template>
  <div class="reminder-popup-backdrop" @click.self="close">
    <section class="reminder-popup">
      <header class="reminder-popup-header">
        <h3>reminders for {{ date }}</h3>
        <button class="close-btn" @click="close">✕</button>
      </header>

      <ul>
        <li
          v-for="reminder in reminders"
          :key="reminder.id"
          class="reminder-item clickable"
          @click="openreminder(reminder.id)"
        >
          <div class="reminder-title">{{ reminder.title }}</div>
          <div class="reminder-meta">
            <span>{{ reminder.date }}</span>
            <span>{{ reminder.status }}</span>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { type PropType } from 'vue'
import { useRouter } from 'vue-router'
import type { ReminderDisplayItem } from '@/types/mock'

defineProps({
  date: {
    type: String,
    required: true,
  },
  reminders: {
    type: Array as PropType<ReminderDisplayItem[]>,
    required: true,
  },
})

const emit = defineEmits(['close'])
const router = useRouter()

function close() {
  emit('close')
}

function openreminder(id: string) {
  if (!id) return
  router.push({ name: 'reminder', query: { id } })
  emit('close')
}
</script>

<style scoped>
.reminder-popup-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.reminder-popup {
  width: min(90vw, 420px);
  max-height: 80vh;
  overflow-y: auto;
  background: white;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 20px 35px rgba(15, 23, 42, 0.15);
}

.reminder-popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.close-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 20px;
  font-weight: 700;
}

.reminder-item {
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
  cursor: default;
}

.reminder-item:last-child {
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
.clickable {
  cursor: pointer;
}
</style>
