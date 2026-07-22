<template>
  <div class="calendar">
    <header class="cal-header">
      <button class="nav-btn" @click="prevMonth">‹</button>
      <div class="cal-header-center">
        <select v-model.number="month" class="month-select" aria-label="Select month">
          <option v-for="(name, idx) in monthNames" :key="name" :value="idx">{{ name }}</option>
        </select>
        <select v-model.number="year" class="year-select" aria-label="Select year">
          <option v-for="option in yearOptions" :key="option" :value="option">{{ option }}</option>
        </select>
      </div>
      <button class="nav-btn" @click="nextMonth">›</button>
    </header>

    <div class="week-days">
      <div v-for="d in weekDays" :key="d" class="week-day">{{ d }}</div>
    </div>

    <div class="days-grid">
      <div
        v-for="(cell, idx) in cells"
        :key="idx"
        class="day-cell"
        :class="{
          'other-month': !cell.inMonth,
          today: cell.isToday,
          clickable: cell.inMonth,
          selected: cell.inMonth && cell.dateKey === selectedDate,
        }"
        @click="selectDate(cell)"
        @dblclick.prevent="handleDayDoubleClick(cell)"
      >
        <div class="day-number" v-if="cell.inMonth">{{ cell.day }}</div>
        <div v-if="cell.dateKey && hasItems(cell.dateKey)" class="day-markers">
          <span v-if="remindersByDate[cell.dateKey]?.length" class="day-marker reminder-marker">
            {{ remindersByDate[cell.dateKey]?.length }}
          </span>
          <span v-if="ticketsByDate[cell.dateKey]?.length" class="day-marker ticket-marker">
            {{ ticketsByDate[cell.dateKey]?.length }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { Reminder, Ticket } from '@/types/mock'
import { toLocalDateKey } from '@/utils/datetime'

const props = defineProps<{ reminders: Reminder[]; tickets: Ticket[] }>()
const emit = defineEmits<{
  (e: 'select-date', payload: { date: string; reminders: Reminder[]; tickets: Ticket[] }): void
  (e: 'double-click-date', payload: { date: string }): void
}>()

const today = new Date()
const year = ref(today.getFullYear())
const month = ref(today.getMonth())

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const yearOptions = computed(() => {
  const current = today.getFullYear()
  const start = current - 10
  const end = current + 10
  const options: number[] = []

  for (let y = start; y <= end; y++) {
    options.push(y)
  }

  if (!options.includes(year.value)) {
    options.push(year.value)
    options.sort((a, b) => a - b)
  }

  return options
})

function dateKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function toDayKey(value: string) {
  return toLocalDateKey(value)
}

const selectedDate = ref<string | null>(null)

function emitSelectedDate(date: string) {
  emit('select-date', {
    date,
    reminders: remindersByDate.value[date] || [],
    tickets: ticketsByDate.value[date] || [],
  })
}

const remindersByDate = computed(() => {
  return props.reminders.reduce(
    (map, reminder) => {
      if (!reminder.dueDate) {
        return map
      }

      const dueDate = toDayKey(reminder.dueDate)
      if (!dueDate) {
        return map
      }

      const existing = map[dueDate] ?? []
      map[dueDate] = [...existing, reminder]
      return map
    },
    {} as Record<string, Reminder[]>,
  )
})

const ticketsByDate = computed(() => {
  return props.tickets.reduce(
    (map, ticket) => {
      const dueDate = toDayKey(ticket.scheduledDate)
      const existing = map[dueDate] ?? []
      map[dueDate] = [...existing, ticket]
      return map
    },
    {} as Record<string, Ticket[]>,
  )
})

function hasItems(dateKey: string) {
  return Boolean(remindersByDate.value[dateKey]?.length || ticketsByDate.value[dateKey]?.length)
}

const firstOfMonth = computed(() => new Date(year.value, month.value, 1))
const daysInMonth = computed(() => new Date(year.value, month.value + 1, 0).getDate())
const startDay = computed(() => firstOfMonth.value.getDay())

const totalCells = computed(() => Math.ceil((startDay.value + daysInMonth.value) / 7) * 7)

const cells = computed(() => {
  const arr: Array<{
    day: number | null
    inMonth: boolean
    isToday: boolean
    dateKey: string | null
  }> = []
  for (let i = 0; i < totalCells.value; i++) {
    const dayNum = i - startDay.value + 1
    const inMonth = dayNum >= 1 && dayNum <= daysInMonth.value
    const isToday =
      inMonth &&
      year.value === today.getFullYear() &&
      month.value === today.getMonth() &&
      dayNum === today.getDate()

    const key = inMonth ? dateKey(year.value, month.value, dayNum) : null
    arr.push({ day: inMonth ? dayNum : null, inMonth, isToday, dateKey: key })
  }
  return arr
})

function prevMonth() {
  if (month.value === 0) {
    month.value = 11
    year.value -= 1
  } else {
    month.value -= 1
  }
}

function nextMonth() {
  if (month.value === 11) {
    month.value = 0
    year.value += 1
  } else {
    month.value += 1
  }
}

function selectDate(cell: { inMonth: boolean; dateKey: string | null; day: number | null }) {
  if (!cell.inMonth || !cell.dateKey) return
  selectedDate.value = cell.dateKey
  emitSelectedDate(cell.dateKey)
}

function handleDayDoubleClick(cell: {
  inMonth: boolean
  dateKey: string | null
  day: number | null
}) {
  if (!cell.inMonth || !cell.dateKey) return
  emit('double-click-date', { date: cell.dateKey })
}

onMounted(() => {
  const todayDateKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate())
  selectedDate.value = todayDateKey
  emitSelectedDate(todayDateKey)
})

watch([remindersByDate, ticketsByDate], () => {
  if (!selectedDate.value) return
  emitSelectedDate(selectedDate.value)
})
</script>

<style scoped>
.calendar {
  --calendar-max-h: clamp(320px, calc(100dvh - 220px), 900px);
  width: min(100%, calc(var(--calendar-max-h) * 4 / 3));
  max-width: 100%;
  max-height: var(--calendar-max-h);
  aspect-ratio: 4 / 3;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
  padding: 12px;
  background: white;
  box-sizing: border-box;
  display: grid;
  grid-template-rows: auto auto 1fr;
  overflow: hidden;
  margin-inline: auto;
}
.cal-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.cal-header-center {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.month-select,
.year-select {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 6px 10px;
  background: #ffffff;
  color: #0f172a;
  font: inherit;
}

.nav-btn {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #ffffff;
  color: #0f172a;
  padding: 4px 10px;
  cursor: pointer;
}
.week-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}
.week-day {
  text-align: center;
  font-size: 12px;
}
.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  min-height: 0;
  grid-auto-rows: minmax(0, 1fr);
}
.day-cell {
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-start;
  padding: 6px 6px 4px;
  position: relative;
  border: 1px solid #dbe3ee;
  border-radius: 6px;
  background: #ffffff;
  color: #374151;
  user-select: none;
}
.day-number {
  line-height: 1;
}
.day-number,
.day-markers,
.day-marker {
  user-select: none;
}
.day-cell.other-month {
  background: #f3f4f6;
  border-color: #e5e7eb;
  color: #9ca3af;
  cursor: default;
}
.day-cell.other-month .day-number {
  color: #9ca3af;
}
.day-cell.today {
  background: linear-gradient(180deg, var(--color-ocean-mid), var(--color-ocean-dark));
  color: #ffffff;
  font-weight: 600;
  border-color: rgba(142, 185, 229, 0.45);
  box-shadow: inset 0 0 0 1px rgba(215, 232, 246, 0.12);
}
.day-cell.selected {
  background: linear-gradient(180deg, rgba(142, 185, 229, 0.22), rgba(215, 232, 246, 0.48));
  border: 1px solid rgba(78, 137, 204, 0.65);
}
.day-markers {
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: absolute;
  top: 6px;
  left: 6px;
}
.day-marker {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  color: white;
  font-size: 10px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.reminder-marker {
  background: linear-gradient(180deg, var(--color-ocean-bright), var(--color-ocean-mid));
}
.ticket-marker {
  background: linear-gradient(180deg, var(--color-ocean-mid), var(--color-ocean-dark));
}
.reminder-panel {
  margin-top: 16px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(215, 232, 246, 0.22), rgba(255, 255, 255, 0.92));
}
.reminder-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.reminder-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.reminder-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(142, 185, 229, 0.2);
}
.reminder-item:last-child {
  border-bottom: none;
}
.reminder-status {
  font-size: 12px;
  color: var(--color-ocean-mid);
}
.close-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--color-ocean-dark);
  font-weight: 700;
}
.no-reminders {
  color: #5f7f9f;
}
</style>
