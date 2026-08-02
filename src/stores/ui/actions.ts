import { useCustomerStore } from '@/stores/customers'
import { useVesselStore } from '@/stores/vessels'
import { useTicketStore } from '@/stores/tickets'
import { useReminderStore } from '@/stores/reminders'
import type { UiState } from './state'
import { fetchWorkspaceAccess } from '@/services/access/workspace'

export const fetchAllData = async (state: UiState, force = false) => {
  state.loading = true
  state.error = null

  try {
    const customers = useCustomerStore()
    const vessels = useVesselStore()
    const tickets = useTicketStore()
    const reminders = useReminderStore()
    const access = await fetchWorkspaceAccess()

    if (!access.canViewReminders) {
      reminders.reminders.splice(0, reminders.reminders.length)
    }

    await Promise.all([
      customers.fetchCustomers(force),
      vessels.fetchVessels(force),
      tickets.fetchTickets(force),
      access.canViewReminders ? reminders.fetchReminders(force) : Promise.resolve([]),
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

export const resetState = (state: UiState) => {
  const customers = useCustomerStore()
  const vessels = useVesselStore()
  const tickets = useTicketStore()
  const reminders = useReminderStore()

  customers.customers.splice(0, customers.customers.length)
  vessels.vessels.splice(0, vessels.vessels.length)
  tickets.tickets.splice(0, tickets.tickets.length)
  reminders.reminders.splice(0, reminders.reminders.length)
  state.loading = false
  state.loaded = false
  state.error = null
}
