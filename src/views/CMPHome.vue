<template>
  <main>
    <p v-if="uiLoading" class="home-status">Loading reminders...</p>
    <p v-else-if="uiError" class="home-status error">{{ uiError }}</p>

    <HomeCalender :reminders="reminders" :tickets="tickets" @select-date="handleDateSelect" />

    <SingleDayPopUP
      v-if="selectedDay"
      :date="selectedDay"
      :reminders="selectedDayReminders"
      :tickets="selectedDayTickets"
      @close="closeSingleDayPopup"
    />

    <section class="dashboard-panels">
      <ReminderList :reminders="reminderDisplayItems" @select-reminder="openReminder" />
      <TicketList :tickets="ticketDisplayItems" @select-ticket="openTicket" />
    </section>

    <TicketPopUp v-if="selectedTicket" :ticket="selectedTicket" @close="closeTicketPopup" />

    <ReminderPopup
      v-if="selectedReminder"
      :reminder="selectedReminder"
      @close="closeReminderPopup"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import HomeCalender from '../components/Calender/home-calender.vue'
import ReminderList from '../components/Reminder/ReminderList.vue'
import TicketList from '../components/Ticket/TicketList.vue'
import ReminderPopup from '../components/Reminder/ReminderPopUp.vue'
import TicketPopUp from '../components/Ticket/PopUp.vue'
import { useUiStore } from '@/stores/ui'
import { useTicketStore } from '@/stores/tickets'
import { useReminderStore } from '@/stores/reminders'
import type { Ticket, Reminder, ReminderDisplayItem } from '@/types/mock'
import SingleDayPopUP from '../components/Calender/SingleDayPopUP.vue'
import { formatLocalDateTime } from '@/utils/datetime'

const uiStore = useUiStore()
const ticketStore = useTicketStore()
const reminderStore = useReminderStore()
const uiLoading = computed(() => uiStore.loading)
const uiError = computed(() => uiStore.error)
const tickets = computed(() => ticketStore.tickets)
const reminders = computed(() => reminderStore.reminders)

const selectedDay = ref<string | null>(null)
const selectedDayReminders = ref<Reminder[]>([])
const selectedDayTickets = ref<Ticket[]>([])
const selectedReminder = ref<ReminderDisplayItem | null>(null)
const selectedTicket = ref<Ticket | null>(null)

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

function closeSingleDayPopup() {
  selectedDay.value = null
  selectedDayReminders.value = []
  selectedDayTickets.value = []
  selectedReminder.value = null
  selectedTicket.value = null
}

function closeReminderPopup() {
  selectedReminder.value = null
}

function openReminder(reminder: ReminderDisplayItem) {
  if (reminder.type === 'ticket') {
    const ticket = tickets.value.find((item) => item.id === reminder.id)
    if (ticket) {
      selectedTicket.value = ticket
    }
  } else {
    selectedDay.value = null
    selectedReminder.value = reminder
    selectedDayReminders.value = []
    selectedDayTickets.value = []
  }
}

const reminderDisplayItems = computed<ReminderDisplayItem[]>(() => {
  return reminders.value.map((reminder: Reminder) => ({
    id: reminder.id,
    title: reminder.title,
    date: formatLocalDateTime(reminder.dueDate),
    completed: reminder.completed,
    status: reminder.completed ? 'Completed' : 'Open',
    notes: reminder.notes,
    type: 'reminder' as const,
  }))
})

const ticketDisplayItems = computed<ReminderDisplayItem[]>(() => {
  return tickets.value.map((ticket) => ({
    id: ticket.id,
    title: ticket.service_title,
    date: formatLocalDateTime(ticket.scheduledDate),
    completed:
      ticket.status.toLowerCase() === 'completed' || ticket.status.toLowerCase() === 'closed',
    status: ticket.status,
    type: 'ticket' as const,
  }))
})

function openTicket(ticketItem: ReminderDisplayItem) {
  const ticket = tickets.value.find((item) => item.id === ticketItem.id)
  if (ticket) {
    selectedTicket.value = ticket
  }
}

function closeTicketPopup() {
  selectedTicket.value = null
}
</script>

<style scoped>
.dashboard-panels {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.home-status {
  margin-bottom: 12px;
}

.error {
  color: #b91c1c;
}
</style>
