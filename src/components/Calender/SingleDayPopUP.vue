<template>
  <div class="single-day-backdrop" @click.self="close">
    <section class="single-day-popup">
      <header class="single-day-header">
        <div>
          <h3>Schedule for {{ date }}</h3>
          <p class="single-day-subtitle">
            {{
              entries.length
                ? `${entries.length} item${entries.length === 1 ? '' : 's'} scheduled`
                : 'Nothing scheduled'
            }}
          </p>
        </div>
        <button class="close-btn" @click="close">✕</button>
      </header>

      <ul v-if="entries.length" class="single-day-list">
        <li
          v-for="entry in entries"
          :key="`${entry.type}-${entry.id}`"
          class="single-day-item clickable"
          @click="openEntry(entry)"
        >
          <div class="single-day-item-top">
            <div class="single-day-title">{{ entry.title }}</div>
            <span class="type-badge" :class="entry.type">{{ entry.type }}</span>
          </div>
          <div class="single-day-meta">
            <span>{{ entry.date }}</span>
            <span>{{ entry.status }}</span>
          </div>
        </li>
      </ul>

      <p v-else class="single-day-empty">No reminders or tickets are scheduled for this day.</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Reminder, ReminderDisplayItem, Ticket } from '@/types/mock'

type DayEntry =
  | {
      id: string
      type: 'reminder'
      title: string
      date: string
      status: string
      reminder: ReminderDisplayItem
    }
  | {
      id: string
      type: 'ticket'
      title: string
      date: string
      status: string
      ticket: Ticket
    }

const props = defineProps<{
  date: string
  reminders: Reminder[]
  tickets: Ticket[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const router = useRouter()

const entries = computed<DayEntry[]>(() => {
  const reminderEntries = props.reminders.map((reminder) => ({
    id: reminder.id,
    type: 'reminder' as const,
    title: reminder.title,
    date: reminder.dueDate,
    status: reminder.completed ? 'Completed' : 'Open',
    reminder: {
      id: reminder.id,
      title: reminder.title,
      date: reminder.dueDate,
      completed: reminder.completed,
      status: reminder.completed ? 'Completed' : 'Open',
      type: 'reminder' as const,
    },
  }))

  const ticketEntries = props.tickets.map((ticket) => ({
    id: ticket.id,
    type: 'ticket' as const,
    title: ticket.service_title,
    date: ticket.scheduledDate,
    status: ticket.status,
    ticket,
  }))

  return [...reminderEntries, ...ticketEntries]
})

function close() {
  emit('close')
}

function openEntry(entry: DayEntry) {
  if (entry.type === 'reminder') {
    router.push({ name: 'Reminder', query: { id: entry.reminder.id } })
    return
  }

  router.push({ name: 'Ticket', query: { id: entry.ticket.id } })
}
</script>

<style scoped>
.single-day-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.38);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.single-day-popup {
  width: min(92vw, 520px);
  max-height: 82vh;
  overflow-y: auto;
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 22px 40px rgba(15, 23, 42, 0.18);
}

.single-day-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
}

.single-day-header h3 {
  margin: 0;
}

.single-day-subtitle {
  margin: 4px 0 0;
  color: #6b7280;
}

.close-btn {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
}

.single-day-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.single-day-item {
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
}

.single-day-item:last-child {
  border-bottom: none;
}

.single-day-item-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.single-day-title {
  font-weight: 600;
}

.single-day-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
}

.type-badge {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.type-badge.reminder {
  background: #fff7ed;
  color: #c2410c;
}

.type-badge.ticket {
  background: #eff6ff;
  color: #1d4ed8;
}

.single-day-empty {
  margin: 0;
  color: #6b7280;
}

.clickable {
  cursor: pointer;
}
</style>
