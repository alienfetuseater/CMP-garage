<template>
  <section class="assignment-board-page">
    <header class="board-header">
      <div>
        <!-- <p class="board-kicker">Work queue</p> -->
        <h1>Assignment Board</h1>
        <!-- <p class="board-scope">
          {{
            scope === 'assigned'
              ? 'Your open assignments and reminders'
              : 'All open work assignments and your reminders'
          }}
        </p> -->
      </div>
      <button type="button" class="refresh-button" :disabled="loading" @click="loadBoard">
        Refresh
      </button>
    </header>

    <p v-if="error" class="board-error" role="alert">{{ error }}</p>
    <p v-if="loading" class="board-status">Loading assignments...</p>

    <div v-else class="board-columns" aria-label="Assignment categories">
      <section v-for="column in columns" :key="column.key" class="board-column">
        <header class="column-header" :class="`column-${column.key}`">
          <h2>{{ column.label }}</h2>
          <span class="column-count">{{ column.cards.length }}</span>
        </header>

        <div class="card-stack">
          <RouterLink
            v-for="card in column.cards"
            :key="`${card.kind}-${card.id}`"
            class="assignment-card"
            :class="`card-${card.category}`"
            :to="cardRoute(card)"
          >
            <div class="card-heading">
              <h3>{{ card.title }}</h3>
              <span class="card-type">{{ cardTypeLabel(card) }}</span>
            </div>
            <p>{{ card.synopsis }}</p>
          </RouterLink>
          <p v-if="column.cards.length === 0" class="empty-column">No open assignments</p>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  fetchAssignmentBoard,
  type AssignmentBoardResponse,
  type AssignmentCard,
} from '@/services/assignments/board'

const board = ref<AssignmentBoardResponse>({
  scope: 'assigned',
  tickets: [],
  monthlyReports: [],
  reminders: [],
})
const loading = ref(true)
const error = ref('')
// const scope = computed(() => board.value.scope)

const columnDefinitions = [
  { key: 'serviceWork', label: 'Service Work' },
  { key: 'monthlyReport', label: 'Monthly Reports' },
  { key: 'diagnosis', label: 'Diagnosis' },
  { key: 'reminder', label: 'Reminders' },
] as const

const allCards = computed(() => [
  ...board.value.tickets,
  ...board.value.monthlyReports,
  ...board.value.reminders,
])
const columns = computed(() =>
  columnDefinitions.map((column) => ({
    ...column,
    cards: allCards.value.filter((card) => {
      if (column.key === 'serviceWork') {
        return card.category === 'repair' || card.category === 'maintenance'
      }
      return card.category === column.key
    }),
  })),
)

function cardRoute(card: AssignmentCard) {
  return {
    name:
      card.kind === 'ticket'
        ? 'Ticket'
        : card.kind === 'monthlyReport'
          ? 'MonthlyReport'
          : 'Reminder',
    query: { id: card.id },
  }
}

function cardTypeLabel(card: AssignmentCard) {
  if (card.category === 'monthlyReport') return 'Monthly Report'
  return `${card.category.charAt(0).toUpperCase()}${card.category.slice(1)}`
}

async function loadBoard() {
  loading.value = true
  error.value = ''
  try {
    board.value = await fetchAssignmentBoard()
  } catch (loadError) {
    error.value = loadError instanceof Error ? loadError.message : String(loadError)
  } finally {
    loading.value = false
  }
}

onMounted(loadBoard)
</script>

<style scoped>
.assignment-board-page {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 1rem 0 2rem;
}
.board-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid #d8dee5;
  padding-bottom: 1rem;
}
.board-kicker {
  margin: 0 0 0.2rem;
  color: #a33a2b;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}
h1 {
  margin: 0;
  color: #17252f;
  font-family: var(--font-heading);
  font-size: clamp(1.9rem, 3vw, 2.8rem);
  letter-spacing: 0;
}
.board-scope {
  margin: 0.3rem 0 0;
  color: #64717b;
}
.refresh-button {
  border: 1px solid #17252f;
  border-radius: 6px;
  background: #17252f;
  color: #fff;
  padding: 0.65rem 1rem;
  font-weight: 700;
  cursor: pointer;
}
.refresh-button:disabled {
  cursor: wait;
  opacity: 0.55;
}
.board-error {
  border-left: 4px solid #b42318;
  background: #fff1f0;
  color: #8f1d14;
  padding: 0.8rem 1rem;
}
.board-status {
  color: #64717b;
  padding: 2rem 0;
}
.board-columns {
  display: grid;
  grid-template-columns: repeat(4, minmax(250px, 1fr));
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  align-items: start;
}
.board-column {
  min-width: 0;
}
.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-top: 4px solid #516b78;
  padding: 0.75rem 0.15rem 0.65rem;
}
.column-header h2 {
  margin: 0;
  color: #263740;
  font-size: 0.92rem;
  letter-spacing: 0;
  text-transform: uppercase;
}
.column-serviceWork {
  border-color: #b44332;
}
.column-monthlyReport {
  border-color: #287a78;
}
.column-diagnosis {
  border-color: #6c5b8d;
}
.column-reminder {
  border-color: #3f6f9f;
}
.column-count {
  min-width: 1.7rem;
  border-radius: 999px;
  background: #e8ecef;
  color: #35464f;
  padding: 0.18rem 0.4rem;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 800;
}
.card-stack {
  display: grid;
  gap: 0.7rem;
}
.assignment-card {
  --card-accent: #516b78;
  --card-tint: #f4f6f7;
  display: block;
  min-height: 118px;
  border: 1px solid #d9dee2;
  border-left: 5px solid var(--card-accent);
  border-radius: 7px;
  background: var(--card-tint);
  color: inherit;
  padding: 0.9rem;
  box-shadow: 0 4px 12px rgba(24, 37, 45, 0.06);
  text-decoration: none;
}
.card-repair {
  --card-accent: #b44332;
  --card-tint: #fff4f1;
}
.card-maintenance {
  --card-accent: #bd842e;
  --card-tint: #fff8e9;
}
.card-monthlyReport {
  --card-accent: #287a78;
  --card-tint: #edf9f7;
}
.card-diagnosis {
  --card-accent: #6c5b8d;
  --card-tint: #f7f2fc;
}
.card-reminder {
  --card-accent: #3f6f9f;
  --card-tint: #eff7ff;
}
.card-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.65rem;
  margin-bottom: 0.55rem;
}
.card-heading h3 {
  margin-bottom: 0;
}
.card-type {
  flex: 0 0 auto;
  border: 1px solid var(--card-accent);
  color: var(--card-accent);
  padding: 0.14rem 0.35rem;
  font-size: 0.66rem;
  font-weight: 800;
  line-height: 1.2;
  text-transform: uppercase;
}
.assignment-card:hover,
.assignment-card:focus-visible {
  border-color: #71818b;
  box-shadow: 0 7px 18px rgba(24, 37, 45, 0.12);
  transform: translateY(-1px);
}
.assignment-card h3 {
  margin: 0 0 0.55rem;
  color: #182830;
  font-size: 1rem;
  line-height: 1.3;
  letter-spacing: 0;
}
.assignment-card p {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: #5c6971;
  font-size: 0.86rem;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
.empty-column {
  border: 1px dashed #cbd2d7;
  border-radius: 7px;
  margin: 0;
  color: #7a858c;
  padding: 1.25rem 0.75rem;
  text-align: center;
  font-size: 0.82rem;
}
@media (max-width: 700px) {
  .board-header {
    align-items: flex-start;
  }
  .board-columns {
    grid-template-columns: repeat(4, minmax(82vw, 1fr));
    scroll-snap-type: x proximity;
  }
  .board-column {
    scroll-snap-align: start;
  }
}
</style>
