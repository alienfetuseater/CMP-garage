<template>
  <main class="vessel-profile">
    <button class="back" @click="goBack">← Back</button>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <section v-else-if="vessel">
      <div class="profile-actions">
        <button type="button" class="primary" @click="editVessel">Edit Vessel</button>
      </div>
      <h2>{{ vessel.vesselName }}</h2>
      <ul class="details">
        <li>
          <strong>Owner: </strong>
          <span class="clickable owner" @click="openOwner">
            {{ vessel.customerName }} ({{ vessel.customerPhone }})
          </span>
        </li>
        <li><strong>Make: </strong> {{ vessel.vesselMake }}</li>
        <li><strong>Year: </strong> {{ vessel.vesselYear }}</li>
        <li><strong>Engine: </strong> {{ vessel.engineMake }} {{ vessel.engineModel }}</li>
        <li><strong>Hours: </strong> {{ vessel.engineHours }}</li>
      </ul>

      <section class="related">
        <h2>service history</h2>
        <h3>Todos for this vessel</h3>
        <div v-if="loadingTodos">Loading...</div>
        <div v-else>
          <ul v-if="todosForVessel.length">
            <li
              v-for="t in todosForVessel"
              :key="t.id"
              class="todo-item clickable"
              @click="openTodo(t.id)"
            >
              <strong>{{ t.title }}</strong> — {{ t.dueDate }} —
              {{ t.completed ? 'Completed' : 'Open' }}
            </li>
          </ul>
          <div v-else class="small">No todos for this vessel.</div>
        </div>

        <h3 style="margin-top: 12px">Tickets for this vessel</h3>
        <div v-if="loadingTickets">Loading...</div>
        <div v-else>
          <ul v-if="ticketsForVessel.length">
            <li
              v-for="tk in ticketsForVessel"
              :key="tk.id"
              class="ticket-item clickable"
              @click="openTicket(tk.id)"
            >
              <strong>{{ tk.service_title }}</strong> — {{ tk.status }} — {{ tk.priority }} —
              {{ tk.scheduledDate }}
            </li>
          </ul>
          <div v-else class="small">No tickets for this vessel.</div>
        </div>
      </section>
    </section>
    <div v-else>No vessel found.</div>
  </main>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import type { Vessel, Todo, Ticket } from '@/types/mock'

export default defineComponent({
  setup() {
    const store = useDataStore()
    const route = useRoute()
    const router = useRouter()
    const vessel = ref<Vessel | null>(null)
    const loading = ref(true)
    const error = ref<string | null>(null)

    const todosForVessel = ref<Todo[]>([])
    const ticketsForVessel = ref<Ticket[]>([])
    const loadingTodos = ref(false)
    const loadingTickets = ref(false)

    async function load() {
      loading.value = true
      try {
        const id = String(route.query.id || '')
        if (!id) throw new Error('No vessel id provided')

        await store.fetchAllData()
        vessel.value = store.vesselById(id)

        const allTodos = store.todos
        const allTickets = store.tickets

        todosForVessel.value = allTodos.filter(
          (t) => t.relatedTo?.type === 'vessel' && t.relatedTo.id === id,
        )
        ticketsForVessel.value = allTickets.filter((t) => t.vesselId === id)
      } catch (err) {
        error.value = err instanceof Error ? err.message : String(err)
      } finally {
        loading.value = false
      }
    }

    function goBack() {
      router.push({ name: 'CustomerDirectory' })
    }

    function openOwner() {
      const id = vessel.value?.customerId ?? (vessel.value as unknown as { owner?: string })?.owner
      if (id) router.push({ name: 'CustomerProfile', query: { id } })
    }

    function openTodo(id: string) {
      if (id) router.push({ name: 'ToDo', query: { id } })
    }

    function openTicket(id: string) {
      if (id) router.push({ name: 'Ticket', query: { id } })
    }

    function editVessel() {
      if (!vessel.value) return
      router.push({ name: 'RegisterVessel', query: { id: vessel.value.id } })
    }

    onMounted(load)

    return {
      vessel,
      loading,
      error,
      goBack,
      openOwner,
      openTicket,
      todosForVessel,
      ticketsForVessel,
      loadingTodos,
      loadingTickets,
      openTodo,
      editVessel,
    }
  },
})
</script>

<style scoped>
.vessel-profile {
  padding: 12px;
}
.back {
  border: none;
  background: transparent;
  color: #2563eb;
  cursor: pointer;
  margin-bottom: 12px;
}
.details {
  list-style: none;
  padding: 0;
}
.details li {
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}
.owner {
  color: #2563eb;
  cursor: pointer;
}
.ticket-item {
  color: inherit;
  cursor: pointer;
}
.error {
  color: #b91c1c;
}
</style>
