<template>
  <main>
    <HomeCalender :todos="todos" @select-date="handleDateSelect" />

    <section class="dashboard-panels">
      <ToDoList :todos="todoDisplayItems" @select-todo="openTodo" />
    </section>

    <TicketWorkOrder v-if="selectedTicket" :ticket="selectedTicket" @close="closeTicketPopup" />

    <ToDoPopup
      v-if="selectedDay"
      :date="selectedDay"
      :todos="selectedTodos"
      @close="closeTodoPopup"
    />
  </main>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import HomeCalender from '../components/Calender/home-calender.vue'
import ToDoList from '../components/ToDo/ToDoList.vue'
import ToDoPopup from '../components/ToDo/ToDo.vue'
import TicketWorkOrder from './Ticket/TicketWorkOrder.vue'
import { useDataStore } from '@/stores/data'
import type { Ticket, Todo, TodoDisplayItem } from '@/types/mock'

export default defineComponent({
  components: {
    HomeCalender,
    ToDoList,
    ToDoPopup,
    TicketWorkOrder,
  },
  setup() {
    const store = useDataStore()
    const todos = store.todos
    const tickets = store.tickets
    const selectedDay = ref<string | null>(null)
    const selectedTodos = ref<TodoDisplayItem[]>([])
    const selectedTicket = ref<Ticket | null>(null)
    const isLoaded = store.loaded
    const error = store.error

    const vesselCount = computed(() => store.vessels.length)

    async function loadData() {
      try {
        await store.fetchAllData()
      } catch (err) {
        // store.error is updated by the store's fetchAllData() call
        console.error(err)
      }
    }

    onMounted(loadData)

    function handleDateSelect(payload: { date: string; todos: Todo[] }) {
      selectedDay.value = payload.date
      selectedTodos.value = payload.todos.map((todo) => ({
        id: todo.id,
        title: todo.title,
        date: todo.dueDate,
        completed: todo.completed,
        status: todo.completed ? 'Completed' : 'Open',
        type: 'todo' as const,
      }))
    }

    function closeTodoPopup() {
      selectedDay.value = null
      selectedTodos.value = []
    }

    function openTodo(todo: TodoDisplayItem) {
      if (todo.type === 'ticket') {
        const ticket = tickets.find((item) => item.id === todo.id)
        if (ticket) {
          selectedTicket.value = ticket
        }
      } else {
        selectedDay.value = todo.date
        selectedTodos.value = [todo]
      }
    }

    const todoDisplayItems = computed<TodoDisplayItem[]>(() => {
      const todoItems = todos.map((todo) => ({
        id: todo.id,
        title: todo.title,
        date: todo.dueDate,
        completed: todo.completed,
        status: todo.completed ? 'Completed' : 'Open',
        type: 'todo' as const,
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

      return [...todoItems, ...ticketItems].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      )
    })

    function closeTicketPopup() {
      selectedTicket.value = null
    }

    return {
      todos,
      tickets,
      selectedDay,
      selectedTodos,
      selectedTicket,
      todoDisplayItems,
      isLoaded,
      error,
      vesselCount,
      handleDateSelect,
      closeTodoPopup,
      closeTicketPopup,
      openTodo,
    }
  },
})
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
