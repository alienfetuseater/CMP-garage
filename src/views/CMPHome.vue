<template>
  <main class="home-page">
    <p v-if="uiLoading" class="home-status">Loading reminders...</p>
    <p v-else-if="uiError" class="home-status error">{{ uiError }}</p>

    <header class="page-chrome" aria-hidden="true"></header>

    <section class="home-layout">
      <div class="calendar-pane">
        <HomeCalender
          :reminders="reminders"
          :tickets="tickets"
          @select-date="handleDateSelect"
          @double-click-date="handleDateDoubleClick"
        />
      </div>

      <section class="day-feed-panel">
        <div class="day-feed-head">
          <h3>Selected Day Activity</h3>
          <span v-if="selectedDay" class="day-feed-date">{{ selectedDay }}</span>
        </div>

        <p v-if="!selectedDay" class="day-feed-empty">
          Select a day on the calendar to view its tickets and reminders.
        </p>
        <p v-else-if="selectedDayItems.length === 0" class="day-feed-empty">
          No tickets or reminders on this day.
        </p>

        <ul v-else class="day-feed-list">
          <li
            v-for="item in selectedDayItems"
            :key="`${item.type}-${item.id}`"
            class="day-feed-item"
            :class="[item.type, { completed: item.completed }]"
            @click="openDayItem(item)"
          >
            <div class="day-feed-item-top">
              <span class="day-feed-type">{{
                item.type === 'ticket' ? 'Ticket' : 'Reminder'
              }}</span>
              <span class="day-feed-status">{{ item.status }}</span>
            </div>
            <div class="day-feed-title">{{ item.title }}</div>
            <div class="day-feed-meta">{{ item.date }}</div>
          </li>
        </ul>
      </section>
    </section>

    <TicketPopUp v-if="selectedTicket" :ticket="selectedTicket" @close="closeTicketPopup" />

    <ReminderPopup
      v-if="selectedReminder"
      :reminder="selectedReminder"
      @close="closeReminderPopup"
    />

    <div
      v-if="showCreateReminderPrompt"
      class="prompt-backdrop"
      @click.self="closeCreateReminderPrompt"
    >
      <section
        class="prompt-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-reminder-title"
      >
        <h3 id="create-reminder-title">Create reminder?</h3>
        <p v-if="createReminderDate" class="prompt-subtitle">
          Selected date: {{ createReminderDate }}
        </p>
        <div class="prompt-actions">
          <button type="button" class="ghost" @click="closeCreateReminderPrompt">No</button>
          <button type="button" class="primary" @click="confirmCreateReminder">Yes</button>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import HomeCalender from '../components/Calender/home-calender.vue'
import ReminderPopup from '../components/Reminder/ReminderPopUp.vue'
import TicketPopUp from '../components/Ticket/PopUp.vue'
import { useUiStore } from '@/stores/ui'
import { useTicketStore } from '@/stores/tickets'
import { useReminderStore } from '@/stores/reminders'
import type { Ticket, Reminder, ReminderDisplayItem } from '@/types/mock'
import { formatLocalDateTime } from '@/utils/datetime'

const uiStore = useUiStore()
const ticketStore = useTicketStore()
const reminderStore = useReminderStore()
const router = useRouter()
const uiLoading = computed(() => uiStore.loading)
const uiError = computed(() => uiStore.error)
const tickets = computed(() => ticketStore.tickets)
const reminders = computed(() => reminderStore.reminders)

const selectedDay = ref<string | null>(null)
const selectedDayReminders = ref<Reminder[]>([])
const selectedDayTickets = ref<Ticket[]>([])
const selectedReminder = ref<ReminderDisplayItem | null>(null)
const selectedTicket = ref<Ticket | null>(null)
const showCreateReminderPrompt = ref(false)
const createReminderDate = ref<string | null>(null)
type DayFeedItem = ReminderDisplayItem

async function loadData() {
  try {
    await uiStore.fetchAllData()
  } catch (err) {
    console.error(err)
  }
}

onMounted(loadData)

function handleDateSelect(payload: { date: string; reminders: Reminder[]; tickets: Ticket[] }) {
  selectedDay.value = payload.date
  selectedDayReminders.value = payload.reminders
  selectedDayTickets.value = payload.tickets
  selectedReminder.value = null
  selectedTicket.value = null
}

function handleDateDoubleClick(payload: { date: string }) {
  createReminderDate.value = payload.date
  showCreateReminderPrompt.value = true
}

function closeCreateReminderPrompt() {
  showCreateReminderPrompt.value = false
}

function confirmCreateReminder() {
  showCreateReminderPrompt.value = false
  router.push({
    name: 'NewReminder',
    query: createReminderDate.value ? { date: createReminderDate.value } : undefined,
  })
}

function closeReminderPopup() {
  selectedReminder.value = null
}

const selectedDayItems = computed<DayFeedItem[]>(() => {
  const reminderItems: DayFeedItem[] = selectedDayReminders.value.map((reminder: Reminder) => ({
    id: reminder.id,
    title: reminder.title,
    date: formatLocalDateTime(reminder.dueDate),
    completed: reminder.completed,
    status: reminder.completed ? 'Completed' : 'Open',
    notes: reminder.notes,
    type: 'reminder',
  }))

  const ticketItems: DayFeedItem[] = selectedDayTickets.value.map((ticket) => ({
    id: ticket.id,
    title: ticket.service_title,
    date: formatLocalDateTime(ticket.scheduledDate),
    completed:
      ticket.status.toLowerCase() === 'completed' || ticket.status.toLowerCase() === 'closed',
    status: ticket.status,
    type: 'ticket',
  }))

  return [...reminderItems, ...ticketItems].sort((a, b) => a.date.localeCompare(b.date))
})

function openDayItem(item: DayFeedItem) {
  if (item.type === 'ticket') {
    const ticket = selectedDayTickets.value.find((entry) => entry.id === item.id)
    if (ticket) {
      selectedTicket.value = ticket
    }
    return
  }

  const reminder = selectedDayReminders.value.find((entry) => entry.id === item.id)
  if (!reminder) return

  selectedReminder.value = {
    id: reminder.id,
    title: reminder.title,
    date: formatLocalDateTime(reminder.dueDate),
    completed: reminder.completed,
    status: reminder.completed ? 'Completed' : 'Open',
    notes: reminder.notes,
    type: 'reminder',
  }
}

function closeTicketPopup() {
  selectedTicket.value = null
}
</script>

<style scoped>
.home-page {
  --page-chrome-height: 72px;
  min-height: calc(100vh - 24px);
  padding: 24px 16px 40px;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
  display: flex;
  flex-direction: column;
}

.page-chrome {
  min-height: 0;
}

.home-layout {
  margin-top: 12px;
  flex: 1;
  display: grid;
  grid-template-columns: minmax(250px, 340px) minmax(0, 1fr) minmax(250px, 340px);
  gap: 18px;
  align-items: start;
}

.calendar-pane {
  display: flex;
  justify-content: center;
  align-items: center;
  grid-column: 2;
}

.day-feed-panel {
  grid-column: 3;
  align-self: start;
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface);
}

.day-feed-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.day-feed-head h3 {
  margin: 0;
}

.day-feed-date {
  font-size: 0.9rem;
  color: #475569;
}

.day-feed-empty {
  margin: 0;
  color: #64748b;
}

.day-feed-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.day-feed-item {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(215, 232, 246, 0.22), rgba(255, 255, 255, 0.82));
  padding: 10px 12px;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(142, 185, 229, 0.08);
}

.day-feed-item + .day-feed-item {
  margin-top: 8px;
}

.day-feed-item:hover {
  background: linear-gradient(180deg, rgba(142, 185, 229, 0.28), rgba(255, 255, 255, 0.9));
}

.day-feed-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.day-feed-type {
  font-size: 0.73rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-ocean-mid);
  font-weight: 700;
}

.day-feed-status {
  font-size: 0.78rem;
  color: var(--color-ocean-mid);
}

.day-feed-title {
  margin-top: 4px;
  font-weight: 700;
  color: var(--color-ocean-dark);
}

.day-feed-meta {
  margin-top: 2px;
  font-size: 0.83rem;
  color: #5f7f9f;
}

.day-feed-item.ticket {
  border-left: 4px solid var(--color-ocean-mid);
}

.day-feed-item.reminder {
  border-left: 4px solid var(--color-ocean-bright);
}

.day-feed-item.completed .day-feed-title {
  text-decoration: line-through;
  color: #64748b;
}

@media (max-width: 768px) {
  .home-layout {
    flex: 0 0 auto;
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .calendar-pane,
  .day-feed-panel {
    grid-column: auto;
  }

  .day-feed-head {
    align-items: flex-start;
    flex-direction: column;
  }
}

.home-status {
  margin-bottom: 12px;
}

.error {
  color: #b91c1c;
}

.prompt-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(8, 18, 29, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
}

.prompt-card {
  width: min(90vw, 360px);
  border: 1px solid rgba(142, 185, 229, 0.26);
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(215, 232, 246, 0.8));
  box-shadow: 0 22px 40px rgba(8, 18, 29, 0.24);
  padding: 18px;
}

.prompt-card h3 {
  margin: 0;
  color: var(--color-ocean-dark);
}

.prompt-subtitle {
  margin: 8px 0 0;
  color: #5f7f9f;
  font-size: 0.92rem;
}

.prompt-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
