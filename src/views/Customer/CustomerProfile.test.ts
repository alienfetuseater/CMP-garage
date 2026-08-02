// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CustomerProfile from './CustomerProfile.vue'

const { routeState, routerPush, customerStore, vesselStore, uiStore, workspaceAccessMock } =
  vi.hoisted(() => ({
    routeState: { query: {} as Record<string, string> },
    routerPush: vi.fn(),
    customerStore: {
      customerById: vi.fn(),
    },
    vesselStore: {
      vessels: [] as Array<Record<string, unknown>>,
    },
    uiStore: {
      loading: false,
      error: null as string | null,
      fetchAllData: vi.fn().mockResolvedValue(undefined),
    },
    workspaceAccessMock: vi.fn(),
  }))

vi.mock('vue-router', () => ({
  useRoute: () => routeState,
  useRouter: () => ({
    push: routerPush,
  }),
}))

vi.mock('@/stores/ui', () => ({
  useUiStore: () => uiStore,
}))

vi.mock('@/stores/customers', () => ({
  useCustomerStore: () => customerStore,
}))

vi.mock('@/stores/vessels', () => ({
  useVesselStore: () => vesselStore,
}))

vi.mock('@/services/access/workspace', () => ({
  fetchWorkspaceAccess: workspaceAccessMock,
}))

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

describe('views/Customer/CustomerProfile.vue', () => {
  beforeEach(() => {
    routeState.query = { id: 'c-1' }
    routerPush.mockReset()
    customerStore.customerById.mockReset()
    uiStore.fetchAllData.mockClear()
    uiStore.loading = false
    uiStore.error = null
    vesselStore.vessels = []
    workspaceAccessMock.mockReset().mockResolvedValue({
      canRegisterCustomers: true,
      canViewDirectory: true,
      canUseSearch: true,
      canManageCustomers: true,
      canManageVessels: true,
      canViewReminders: true,
      canManageReminders: true,
      canViewOpenTicketList: true,
      canCreateTickets: true,
      canCreateReports: true,
    })
  })

  it('renders customer details and vessels after loading', async () => {
    customerStore.customerById.mockImplementation((id: string) => {
      return id === 'c-1'
        ? {
            id: 'c-1',
            name: 'Jane Doe',
            phone: '555-123-4567',
            email: 'jane@example.com',
            address: '1 Dock Street',
            createdAt: '2024-01-01T00:00:00.000Z',
          }
        : null
    })

    vesselStore.vessels = [
      {
        id: 'v-1',
        customerId: 'c-1',
        customerName: 'Jane Doe',
        customerPhone: '555-123-4567',
        vesselName: 'Sea Breeze',
        vesselMake: 'Boston Whaler',
        vesselYear: 2020,
        hullIdNumber: 'ABC-123',
        numberOfEngines: 1,
        engineSerialNumbers: ['eng-1'],
        generator: false,
        boatLocation: 'slip',
        engineMake: 'Yamaha',
        engineModel: 'F150',
        engineHorsepower: 150,
        engineHours: 820,
      },
    ]

    const wrapper = mount(CustomerProfile)
    await flushPromises()

    expect(wrapper.text()).toContain('Customer profile')
    expect(wrapper.text()).toContain('Jane Doe')
    expect(wrapper.text()).toContain('jane@example.com')
    expect(wrapper.text()).toContain('Sea Breeze')
    expect(wrapper.text()).toContain('Boston Whaler')
  })
})
