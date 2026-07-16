import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { apiFetch } from '@/api'
import type { Customer, Vessel, Ticket, Todo } from '@/types/mock'

export const useDataStore = defineStore('data', () => {
  const customers = ref<Customer[]>([])
  const vessels = ref<Vessel[]>([])
  const todos = ref<Todo[]>([])
  const tickets = ref<Ticket[]>([])
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref<string | null>(null)

  const customerById = (id: string) => customers.value.find((item) => item.id === id) ?? null
  const vesselById = (id: string) => vessels.value.find((item) => item.id === id) ?? null
  const ticketById = (id: string) => tickets.value.find((item) => item.id === id) ?? null
  const todoById = (id: string) => todos.value.find((item) => item.id === id) ?? null

  const getCustomer = async (id: string) => {
    if (!loaded.value) await fetchAllData()
    return customerById(id)
  }

  const getVessel = async (id: string) => {
    if (!loaded.value) await fetchAllData()
    return vesselById(id)
  }

  const getTicket = async (id: string) => {
    if (!loaded.value) await fetchAllData()
    return ticketById(id)
  }

  const getTodo = async (id: string) => {
    if (!loaded.value) await fetchAllData()
    return todoById(id)
  }

  const todosForVessel = (vesselId: string) =>
    todos.value.filter(
      (todo) => todo.relatedTo?.type === 'vessel' && todo.relatedTo.id === vesselId,
    )

  const ticketsForVessel = (vesselId: string) =>
    tickets.value.filter((ticket) => ticket.vesselId === vesselId)

  const fetchCustomers = async (force = false) => {
    if (!force && customers.value.length > 0) return customers.value
    const data = await apiFetch<Customer[]>('/getAllCustomers')
    customers.value = data
    return customers.value
  }

  const fetchVessels = async (force = false) => {
    if (!force && vessels.value.length > 0) return vessels.value
    const data = await apiFetch<Vessel[]>('/getAllBoats')
    vessels.value = data
    return vessels.value
  }

  const fetchTodos = async (force = false) => {
    if (!force && todos.value.length > 0) return todos.value
    const data = await apiFetch<Todo[]>('/getAllToDos')
    todos.value = data
    return todos.value
  }

  const fetchTickets = async (force = false) => {
    if (!force && tickets.value.length > 0) return tickets.value
    const data = await apiFetch<Ticket[]>('/getAllTickets')
    tickets.value = data
    return tickets.value
  }

  const addCustomer = (customer: Customer) => {
    customers.value.push(customer)
  }

  const addVessel = (vessel: Vessel) => {
    const index = vessels.value.findIndex((item) => item.id === vessel.id)
    if (index >= 0) {
      vessels.value[index] = vessel
    } else {
      vessels.value.push(vessel)
    }
  }

  const addTodo = (todo: Todo) => {
    const index = todos.value.findIndex((item) => item.id === todo.id)
    if (index >= 0) {
      todos.value[index] = todo
    } else {
      todos.value.push(todo)
    }
  }

  const addTicket = (ticket: Ticket) => {
    const index = tickets.value.findIndex((item) => item.id === ticket.id)
    if (index >= 0) {
      tickets.value[index] = ticket
    } else {
      tickets.value.push(ticket)
    }
  }

  const fetchAllData = async (force = false) => {
    loading.value = true
    error.value = null

    try {
      await Promise.all([
        fetchCustomers(force),
        fetchVessels(force),
        fetchTodos(force),
        fetchTickets(force),
      ])
      loaded.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const ensureAllData = async () => {
    if (!loaded.value) {
      await fetchAllData()
    }
  }

  const customerCount = computed(() => customers.value.length)
  const vesselCount = computed(() => vessels.value.length)

  return {
    customers,
    vessels,
    todos,
    tickets,
    loading,
    loaded,
    error,
    customerCount,
    vesselCount,
    fetchAllData,
    ensureAllData,
    fetchCustomers,
    fetchVessels,
    fetchTodos,
    fetchTickets,
    customerById,
    vesselById,
    ticketById,
    todoById,
    getCustomer,
    getVessel,
    getTicket,
    getTodo,
    todosForVessel,
    ticketsForVessel,
    addCustomer,
    addVessel,
    addTodo,
    addTicket,
  }
})
