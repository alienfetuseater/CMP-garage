<template>
  <main>
    <HomeCalender :reminders="reminders" @select-date="handleDateSelect" />

    <section class="dashboard-panels">
      <reminderList :reminders="reminderDisplayItems" @select-reminder="openreminder" />
    </section>

    <TicketWorkOrder v-if="selectedTicket" :ticket="selectedTicket" @close="closeTicketPopup" />

    <reminderPopup
      v-if="selectedDay"
      :date="selectedDay"
      :reminders="selectedReminders"
      @close="closereminderPopup"
    />
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import HomeCalender from '../components/Calender/home-calender.vue'
import reminderList from '../components/Reminder/ReminderList.vue'
import reminderPopup from '../components/Reminder/ReminderPopUp.vue'
import TicketWorkOrder from '../components/Ticket/TicketPopUp.vue'
import { useUiStore } from '@/stores/ui'
import { useTicketStore } from '@/stores/tickets'
import { useReminderStore } from '@/stores/reminders'
import type { Ticket, Reminder, ReminderDisplayItem } from '@/types/mock'

const uiStore = useUiStore()
const ticketStore = useTicketStore()
const tickets = ticketStore.tickets
const reminderStore = useReminderStore()
const reminders = reminderStore.reminders
const selectedDay = ref<string | null>(null)
const selectedReminders = ref<ReminderDisplayItem[]>([])
const selectedTicket = ref<Ticket | null>(null)

async function loadData() {
  try {
    await uiStore.fetchAllData()
  } catch (err) {
    // store.error is updated by the store's fetchAllData() call
    console.error(err)
  }
}

onMounted(loadData)

function handleDateSelect(payload: { date: string; reminders: Reminder[] }) {
  selectedDay.value = payload.date
  selectedReminders.value = payload.reminders.map((reminder) => ({
    id: reminder.id,
    title: reminder.title,
    date: reminder.dueDate,
    completed: reminder.completed,
    status: reminder.completed ? 'Completed' : 'Open',
    type: 'reminder' as const,
  }))
}

function closereminderPopup() {
  selectedDay.value = null
  selectedReminders.value = []
}

function openreminder(reminder: ReminderDisplayItem) {
  if (reminder.type === 'ticket') {
    const ticket = tickets.find((item) => item.id === reminder.id)
    if (ticket) {
      selectedTicket.value = ticket
    }
  } else {
    selectedDay.value = reminder.date
    selectedReminders.value = [reminder]
  }
}

const reminderDisplayItems = computed<ReminderDisplayItem[]>(() => {
  const reminderItems = reminders.map((reminder: Reminder) => ({
    id: reminder.id,
    title: reminder.title,
    date: reminder.dueDate,
    completed: reminder.completed,
    status: reminder.completed ? 'Completed' : 'Open',
    type: 'reminder' as const,
  }))

  const ticketItems = tickets.map((ticket) => ({
    id: ticket.id,
    title: ticket.service_title,
    date: ticket.scheduledDate,
    completed:
      ticket.status.toLowerCase() === 'completed' || ticket.status.toLowerCase() === 'closed',
    status: ticket.status,
    type: 'ticket' as const,
  }))

  return [...reminderItems, ...ticketItems].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )
})

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

.error {
  color: #b91c1c;
}
</style>
