// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TheTicket from './TheTicket.vue'

const {
  routeState,
  routerPush,
  routerBack,
  uiStore,
  ticketStore,
  customerStore,
  vesselStore,
  mockedApiFetch,
} = vi.hoisted(() => ({
  routeState: { query: { id: 't-1' } as Record<string, string> },
  routerPush: vi.fn(),
  routerBack: vi.fn(),
  uiStore: { fetchAllData: vi.fn().mockResolvedValue(undefined) },
  ticketStore: { addTicket: vi.fn() },
  customerStore: { customers: [{ id: 'c-1', name: 'Jane Harbor' }] as any[] },
  vesselStore: { vessels: [{ id: 'v-1', vesselName: 'Sea Breeze' }] as any[] },
  mockedApiFetch: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRoute: () => routeState,
  useRouter: () => ({
    push: routerPush,
    back: routerBack,
  }),
}))

vi.mock('@/services/http/client', () => ({
  API_BASE: 'http://localhost:8000',
  apiFetch: mockedApiFetch,
}))

vi.mock('@/stores/ui', () => ({
  useUiStore: () => uiStore,
}))

vi.mock('@/stores/tickets', () => ({
  useTicketStore: () => ticketStore,
}))

vi.mock('@/stores/customers', () => ({
  useCustomerStore: () => customerStore,
}))

vi.mock('@/stores/vessels', () => ({
  useVesselStore: () => vesselStore,
}))

function flushPromises() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0)
  })
}

describe('views/Ticket/TheTicket.vue', () => {
  beforeEach(() => {
    routeState.query = { id: 't-1' }
    routerPush.mockReset()
    routerBack.mockReset()
    uiStore.fetchAllData.mockClear()
    ticketStore.addTicket.mockReset()
    mockedApiFetch.mockReset()
  })

  it('loads a ticket and renders closed-ticket state with invoice total', async () => {
    mockedApiFetch.mockResolvedValue({
      id: 't-1',
      customerId: 'c-1',
      vesselId: 'v-1',
      customerName: 'Jane Harbor',
      vesselName: 'Sea Breeze',
      service_category: 'repair',
      service_title: 'Bilge Pump Repair',
      status: 'closed',
      priority: 'high',
      createdAt: '2026-07-01T00:00:00.000Z',
      scheduledDate: '2026-07-02T00:00:00.000Z',
      notes: '',
      laborCost: 120,
      requiredParts: [
        { id: 'rp-1', text: 'Pump Kit', completed: true, cost: 50 },
        { id: 'rp-2', text: 'Hose Clamp', completed: false, cost: 20 },
      ],
      planOfAction: [{ id: 'p-1', text: 'Replace pump', completed: true }],
      diagnostics: {},
    })

    const wrapper = mount(TheTicket)
    await flushPromises()

    expect(uiStore.fetchAllData).toHaveBeenCalled()
    expect(mockedApiFetch).toHaveBeenCalledWith('/getTicketProfile?id=t-1')
    expect(wrapper.text()).toContain('Reopen Ticket')
    expect(wrapper.text()).toContain('$170.00')
  })
})
