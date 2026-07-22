<template>
  <div class="reminder-popup-backdrop" @click.self="close">
    <section class="reminder-popup">
      <header class="reminder-header">
        <div>
          <h3 class="clickable" @click="openReminder">Reminder</h3>
          <p class="reminder-subtitle clickable" @click="openReminder">
            {{ reminder.title }}
          </p>
        </div>
        <button class="close-btn" @click="close">✕</button>
      </header>

      <ul class="reminder-details clickable" @click="openReminder">
        <li class="reminder-item clickable"><strong>status:</strong> {{ reminder.status }}</li>
        <li class="reminder-item clickable"><strong>due date:</strong>{{ reminder.date }}</li>
        <li class="reminder-item clickable">
          <strong>notes:</strong> {{ reminder.notes || 'none' }}
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { useRouter } from 'vue-router'
import type { ReminderDisplayItem } from '@/types/mock'

const props = defineProps({
  reminder: {
    type: Object as PropType<ReminderDisplayItem>,
    required: true,
  },
})

const emit = defineEmits(['close'])
const router = useRouter()

function close() {
  emit('close')
}

function openReminder() {
  openreminder(props.reminder)
}

function openreminder(reminder: ReminderDisplayItem & { _id?: string }) {
  const id = String(reminder.id ?? reminder._id ?? '')
  if (!id) return
  router.push({ name: 'Reminder', query: { id } })
  emit('close')
}
</script>

<style scoped>
.reminder-popup-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(8, 18, 29, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.reminder-popup {
  width: min(90vw, 520px);
  min-height: min(80vh, 360px);
  max-height: 80vh;
  overflow-y: auto;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(215, 232, 246, 0.82));
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 22px 40px rgba(8, 18, 29, 0.22);
  border: 1px solid rgba(142, 185, 229, 0.26);
}

.reminder-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
}

.reminder-header h3 {
  margin: 0;
}

.reminder-subtitle {
  margin: 4px 0 0;
  color: var(--color-ocean-mid);
}

.close-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 20px;
  font-weight: 700;
}

.reminder-details {
  list-style: none;
  margin: 0;
  padding: 0;
}

.reminder-item {
  padding: 12px 0;
  border-bottom: 1px solid rgba(142, 185, 229, 0.2);
  cursor: default;
}

.reminder-item:last-child {
  border-bottom: none;
}

.reminder-item strong {
  display: inline-block;
  width: 125px;
  color: var(--color-ocean-dark);
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
