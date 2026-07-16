import { useCustomerStore } from '@/stores/customers'
import { useVesselStore } from '@/stores/vessels'
import { useTicketStore } from '@/stores/tickets'
import { useTodoStore } from '@/stores/todos'
import type { UiState } from './state'

export const fetchAllData = async (state: UiState, force = false) => {
  state.loading = true
  state.error = null

  try {
    const customers = useCustomerStore()
    const vessels = useVesselStore()
    const tickets = useTicketStore()
    const todos = useTodoStore()

    await Promise.all([
      customers.fetchCustomers(force),
      vessels.fetchVessels(force),
      tickets.fetchTickets(force),
      todos.fetchTodos(force),
    ])

    state.loaded = true
  } catch (err) {
    state.error = err instanceof Error ? err.message : String(err)
    throw err
  } finally {
    state.loading = false
  }
}

export const ensureAllData = async (state: UiState) => {
  if (!state.loaded) await fetchAllData(state)
}
