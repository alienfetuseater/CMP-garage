<template>
  <div class="calendar">
    <header class="cal-header">
      <button class="nav-btn" @click="prevMonth">‹</button>
      <h2>{{ monthName }} {{ year }}</h2>
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
      >
        <div class="day-number" v-if="cell.inMonth">{{ cell.day }}</div>
        <div v-if="cell.dateKey && remindersByDate[cell.dateKey]?.length" class="reminder-badge">
          {{ remindersByDate[cell.dateKey]?.length }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Reminder } from '@/types/mock'

const props = defineProps<{ reminders: Reminder[] }>()
const emit = defineEmits<{
  (e: 'select-date', payload: { date: string; reminders: Reminder[] }): void
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

function dateKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

const selectedDate = ref<string | null>(null)

const remindersByDate = computed(() => {
  return props.reminders.reduce(
    (map, reminder) => {
      const dueDate = reminder.dueDate
      const existing = map[dueDate] ?? []
      map[dueDate] = [...existing, reminder]
      return map
    },
    {} as Record<string, Reminder[]>,
  )
})

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

const monthName = computed(() => monthNames[month.value])

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
  emit('select-date', {
    date: cell.dateKey,
    reminders: remindersByDate.value[cell.dateKey] || [],
  })
}
</script>

<style scoped>
.calendar {
  width: 100%;
  max-width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  background: white;
  box-sizing: border-box;
}
.cal-header {
  text-align: center;
  margin-bottom: 8px;
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
}
.day-cell {
  min-height: 40px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 6px;
  border-radius: 6px;
  color: #374151;
}
.day-cell.other-month {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: default;
}
.day-cell.other-month .day-number {
  color: #9ca3af;
}
.day-cell.today {
  background: #2563eb;
  color: white;
  font-weight: 600;
}
.day-cell.selected {
  background: #e0f2fe;
  border: 1px solid #60a5fa;
}
.reminder-badge {
  margin-top: 4px;
  padding: 2px 6px;
  background: #f59e0b;
  color: white;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}
.reminder-panel {
  margin-top: 16px;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #f8fafc;
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
  border-bottom: 1px solid #e5e7eb;
}
.reminder-item:last-child {
  border-bottom: none;
}
.reminder-status {
  font-size: 12px;
  color: #6b7280;
}
.close-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  color: #374151;
  font-weight: 700;
}
.no-reminders {
  color: #6b7280;
}
</style>
