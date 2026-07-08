<template>
  <main>
    <HomeCalender :todos="todos" @select-date="handleDateSelect" />

    <section class="dashboard-panels">
      <ToDoList :todos="todoDisplayItems" @select-todo="openTodo" />
      <MessagesList :conversations="conversations" @select-conversation="openConversation" />
    </section>

    <ConversationThread
      v-if="selectedConversation"
      :conversation="selectedConversation"
      @close="closeConversation"
    />

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
import MessagesList from '../components/Messages/MessagesList.vue'
import ConversationThread from '../components/Messages/ConversationThread.vue'
import ToDoList from '../components/ToDo/ToDoList.vue'
import ToDoPopup from '../components/ToDo/ToDo.vue'
import TicketWorkOrder from './Ticket/TicketWorkOrder.vue'
import type { Conversation, Customer, VesselMap, Ticket, Todo, TodoDisplayItem } from '@/types/mock'

export default defineComponent({
  components: {
    HomeCalender,
    MessagesList,
    ConversationThread,
    ToDoList,
    ToDoPopup,
    TicketWorkOrder,
  },
  setup() {
    const customers = ref<Customer[]>([])
    const vessels = ref<VesselMap | null>(null)
    const todos = ref<Todo[]>([])
    const tickets = ref<Ticket[]>([])
    const conversations = ref<Conversation[]>([])
    const selectedDay = ref<string | null>(null)
    const selectedTodos = ref<TodoDisplayItem[]>([])
    const selectedTicket = ref<Ticket | null>(null)
    const selectedConversation = ref<Conversation | null>(null)
    const isLoaded = ref(false)
    const error = ref<string | null>(null)

    const vesselCount = computed(() => (vessels.value ? Object.keys(vessels.value).length : 0))

    async function loadMockData() {
      try {
        const [customersRes, vesselsRes, todosRes, ticketsRes] = await Promise.all([
          fetch('/mock/customers.json'),
          fetch('/mock/vessels.json'),
          fetch('/mock/todos.json'),
          fetch('/mock/tickets.json'),
        ])

        if (!customersRes.ok || !vesselsRes.ok || !todosRes.ok || !ticketsRes.ok) {
          throw new Error('One or more mock files failed to load')
        }

        customers.value = await customersRes.json()
        vessels.value = await vesselsRes.json()
        todos.value = await todosRes.json()
        tickets.value = await ticketsRes.json()

        const messageFiles = [
          'conversation-1.json',
          'conversation-2.json',
          'conversation-3.json',
          'conversation-4.json',
          'conversation-5.json',
        ]

        const messageResponses = await Promise.all(
          messageFiles.map((file) => fetch(`/mock/messages/${file}`)),
        )

        if (messageResponses.some((res) => !res.ok)) {
          throw new Error('One or more message fixtures failed to load')
        }

        const messagesData = await Promise.all(messageResponses.map((res) => res.json()))

        conversations.value = messagesData.map((messages, index) => ({
          id: `Conversation ${index + 1}`,
          messages,
        }))
      } catch (err) {
        error.value = err instanceof Error ? err.message : String(err)
      } finally {
        isLoaded.value = true
      }
    }

    onMounted(loadMockData)

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
        const ticket = tickets.value.find((item) => item.id === todo.id)
        if (ticket) {
          selectedTicket.value = ticket
        }
      } else {
        selectedDay.value = todo.date
        selectedTodos.value = [todo]
      }
    }

    function openConversation(conversation: Conversation) {
      selectedConversation.value = conversation
    }

    const todoDisplayItems = computed<TodoDisplayItem[]>(() => {
      const todoItems = todos.value.map((todo) => ({
        id: todo.id,
        title: todo.title,
        date: todo.dueDate,
        completed: todo.completed,
        status: todo.completed ? 'Completed' : 'Open',
        type: 'todo' as const,
      }))

      const ticketItems = tickets.value.map((ticket) => ({
        id: ticket.id,
        title: ticket.title,
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

    function closeConversation() {
      selectedConversation.value = null
    }

    function closeTicketPopup() {
      selectedTicket.value = null
    }

    return {
      customers,
      vessels,
      todos,
      tickets,
      conversations,
      selectedDay,
      selectedTodos,
      selectedTicket,
      selectedConversation,
      todoDisplayItems,
      isLoaded,
      error,
      vesselCount,
      handleDateSelect,
      closeTodoPopup,
      openConversation,
      closeConversation,
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

.mock-summary {
  margin: 18px 0;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #f9fafb;
}

.mock-summary h3 {
  margin: 0 0 8px;
}

.mock-summary p {
  margin: 4px 0;
}

.error {
  color: #b91c1c;
}
</style>
