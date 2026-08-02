import { beforeEach, expect, it, vi } from 'vitest'
import { fetchAllData, resetState } from './actions'

const { accessMock, customerStore, vesselStore, ticketStore, reminderStore } = vi.hoisted(() => ({
  accessMock: vi.fn(),
  customerStore: { customers: [{ id: 'cached-customer' }], fetchCustomers: vi.fn() },
  vesselStore: { vessels: [{ id: 'cached-vessel' }], fetchVessels: vi.fn() },
  ticketStore: { tickets: [{ id: 'cached-ticket' }], fetchTickets: vi.fn() },
  reminderStore: { reminders: [{ id: 'cached-reminder' }], fetchReminders: vi.fn() },
}))

vi.mock('@/services/access/workspace', () => ({ fetchWorkspaceAccess: accessMock }))
vi.mock('@/stores/customers', () => ({ useCustomerStore: () => customerStore }))
vi.mock('@/stores/vessels', () => ({ useVesselStore: () => vesselStore }))
vi.mock('@/stores/tickets', () => ({ useTicketStore: () => ticketStore }))
vi.mock('@/stores/reminders', () => ({ useReminderStore: () => reminderStore }))

beforeEach(() => {
  accessMock.mockReset().mockResolvedValue({
    canRegisterCustomers: false,
    canViewDirectory: false,
    canUseSearch: false,
    canManageCustomers: false,
    canManageVessels: false,
    canViewReminders: false,
    canManageReminders: false,
    canViewOpenTicketList: false,
    canCreateTickets: false,
    canCreateReports: false,
  })
  customerStore.fetchCustomers.mockReset().mockResolvedValue([])
  vesselStore.fetchVessels.mockReset().mockResolvedValue([])
  ticketStore.fetchTickets.mockReset().mockResolvedValue([])
  reminderStore.fetchReminders.mockReset().mockResolvedValue([])
  reminderStore.reminders = [{ id: 'cached-reminder' }]
})

it('does not load reminders when workspace access denies them', async () => {
  const state = { loading: false, loaded: false, error: null }

  await fetchAllData(state)

  expect(ticketStore.fetchTickets).toHaveBeenCalled()
  expect(reminderStore.fetchReminders).not.toHaveBeenCalled()
  expect(reminderStore.reminders).toEqual([])
  expect(state.loaded).toBe(true)
})

it('clears role-scoped collections when the session resets', () => {
  const state = { loading: true, loaded: true, error: 'stale' }

  resetState(state)

  expect(customerStore.customers).toEqual([])
  expect(vesselStore.vessels).toEqual([])
  expect(ticketStore.tickets).toEqual([])
  expect(reminderStore.reminders).toEqual([])
  expect(state).toEqual({ loading: false, loaded: false, error: null })
})
