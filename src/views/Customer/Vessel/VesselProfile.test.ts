// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import VesselProfile from './VesselProfile.vue'

const { routeState, routerPush, customerStore, vesselStore, uiStore, ticketStore, mockedApiFetch } =
  vi.hoisted(() => ({
    routeState: { query: {} as Record<string, string> },
    routerPush: vi.fn(),
    customerStore: {
      customers: [] as Array<{ id: string; name: string; phone: string; address: string }>,
      customerById: vi.fn(),
    },
    vesselStore: {
      addVessel: vi.fn(),
      vesselById: vi.fn(),
    },
    uiStore: {
      loading: false,
      error: null as string | null,
      fetchAllData: vi.fn().mockResolvedValue(undefined),
    },
    ticketStore: {
      tickets: [] as Array<Record<string, unknown>>,
    },
    mockedApiFetch: vi.fn(),
  }))

vi.mock('vue-router', () => ({
  useRoute: () => routeState,
  useRouter: () => ({
    push: routerPush,
    back: vi.fn(),
  }),
}))

vi.mock('@/services/http/client', () => ({
  API_BASE: 'https://example.test',
  apiFetch: mockedApiFetch,
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

vi.mock('@/stores/tickets', () => ({
  useTicketStore: () => ticketStore,
}))

vi.mock('@/stores/monthlyReports', () => ({
  useMonthlyReportStore: () => ({
    reports: [],
    fetchMonthlyReports: vi.fn().mockResolvedValue([]),
    reportsForVessel: vi.fn().mockReturnValue([]),
  }),
}))

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

describe('views/Customer/Vessel/VesselProfile.vue', () => {
  beforeEach(() => {
    routeState.query = { id: 'v-1' }
    routerPush.mockReset()
    customerStore.customerById.mockReset()
    vesselStore.addVessel.mockReset()
    vesselStore.vesselById.mockReset()
    uiStore.fetchAllData.mockClear()
    uiStore.loading = false
    uiStore.error = null
    ticketStore.tickets = []
    mockedApiFetch.mockReset()
  })

  it('renders the vessel overview and service history sections', async () => {
    const customer = {
      id: 'c-1',
      name: 'Jane Doe',
      phone: '1234567890',
      address: '1 Main St',
    }

    customerStore.customerById.mockImplementation((id: string) => {
      return id === 'c-1' ? customer : null
    })
    vesselStore.vesselById.mockReturnValue({
      id: 'v-1',
      customerId: 'c-1',
      customerName: 'Jane Doe',
      customerPhone: '1234567890',
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
      boatPhotoDataUrl: 'data:image/png;base64,abc',
    })
    ticketStore.tickets = [
      {
        id: 't-1',
        customerId: 'c-1',
        vesselId: 'v-1',
        service_category: 'repair',
        service_title: 'Engine fix',
        status: 'open',
        priority: 'high',
        createdAt: '2024-01-01T00:00:00.000Z',
        scheduledDate: '2024-01-10T00:00:00.000Z',
        notes: '',
      },
      {
        id: 't-2',
        customerId: 'c-1',
        vesselId: 'v-1',
        service_category: 'maintenance',
        service_title: 'Oil change',
        status: 'completed',
        priority: 'medium',
        createdAt: '2024-01-02T00:00:00.000Z',
        scheduledDate: '2024-01-11T00:00:00.000Z',
        notes: '',
      },
    ]

    const wrapper = mount(VesselProfile)
    await flushPromises()

    expect(wrapper.text()).toContain('Vessel profile')
    expect(wrapper.text()).toContain('Sea Breeze')
    expect(wrapper.text()).toContain('Jane Doe')
    expect(wrapper.text()).toContain('Repair History')
    expect(wrapper.text()).toContain('Engine fix')
  })
})
