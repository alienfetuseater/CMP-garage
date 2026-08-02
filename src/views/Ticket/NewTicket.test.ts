// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import NewTicket from './NewTicket.vue'

const {
  routeState,
  routerPush,
  routerBack,
  ticketStore,
  customerStore,
  vesselStore,
  uiStore,
  mockedApiFetch,
} = vi.hoisted(() => ({
  routeState: { query: {} as Record<string, string> },
  routerPush: vi.fn(),
  routerBack: vi.fn(),
  ticketStore: { addTicket: vi.fn() },
  customerStore: { customers: [] as any[] },
  vesselStore: { vessels: [] as any[] },
  uiStore: { fetchAllData: vi.fn().mockResolvedValue(undefined) },
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
  apiFetch: mockedApiFetch,
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

vi.mock('@/stores/ui', () => ({
  useUiStore: () => uiStore,
}))

function flushPromises() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0)
  })
}

describe('views/Ticket/NewTicket.vue', () => {
  beforeEach(() => {
    routeState.query = {}
    routerPush.mockReset()
    routerBack.mockReset()
    ticketStore.addTicket.mockReset()
    uiStore.fetchAllData.mockClear()
    mockedApiFetch.mockReset()
    customerStore.customers = []
    vesselStore.vessels = []
  })

  it('renders create mode fields and does not show edit-only sections', async () => {
    const wrapper = mount(NewTicket)
    await flushPromises()

    expect(wrapper.text()).toContain('Create Work Order')
    expect(wrapper.text()).not.toContain('Notes History')
    expect(wrapper.text()).not.toContain('Plan of Action')

    const categoryOptions = wrapper
      .get('select')
      .findAll('option')
      .map((option) => option.attributes('value'))
    expect(categoryOptions).toEqual(['repair', 'maintenance', 'modification'])
  })

  it('hydrates edit mode and shows edit-only sections', async () => {
    routeState.query = { id: 't-1' }
    mockedApiFetch.mockResolvedValue({
      id: 't-1',
      customerId: 'c-1',
      vesselId: 'v-1',
      customerName: 'Jane Harbor',
      vesselName: 'Sea Breeze',
      service_category: 'repair',
      service_title: 'Replace impeller',
      status: 'open',
      priority: 'medium',
      createdAt: '2026-07-01T00:00:00.000Z',
      scheduledDate: '2026-07-02T00:00:00.000Z',
      notes: '[7/1/2026] baseline note',
      planOfAction: [{ id: 'p-1', text: 'Check cooling line', completed: false }],
      requiredParts: [{ id: 'rp-1', text: 'Impeller', completed: true, cost: 55 }],
    })

    const wrapper = mount(NewTicket)
    await flushPromises()

    expect(uiStore.fetchAllData).toHaveBeenCalled()
    expect(mockedApiFetch).toHaveBeenCalledWith('/getTicketProfile?id=t-1')
    expect(wrapper.text()).toContain('Update Work Order')
    expect(wrapper.text()).toContain('Notes History')
    expect(wrapper.text()).toContain('Plan of Action')
  })

  it('shows technicians the assignee without delegation controls', async () => {
    routeState.query = { id: 't-1' }
    const ticket = {
      id: 't-1',
      customerId: 'c-1',
      vesselId: 'v-1',
      service_category: 'repair',
      service_title: 'Replace impeller',
      status: 'open',
      priority: 'medium',
      assignedUserId: 'user-1',
      assignedUserName: 'Taylor Tech',
      createdAt: '2026-07-01T00:00:00.000Z',
      scheduledDate: '2026-07-02T00:00:00.000Z',
      notes: '',
    }
    mockedApiFetch.mockImplementation((endpoint) =>
      endpoint === '/assignments/access'
        ? Promise.reject(new Error('403 Forbidden'))
        : Promise.resolve(ticket),
    )

    const wrapper = mount(NewTicket)
    await flushPromises()

    expect(wrapper.find('[data-testid="assignee-select"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Assigned Technician')
    expect(wrapper.text()).toContain('Taylor Tech')
    expect(mockedApiFetch).not.toHaveBeenCalledWith('/users/assignable')
  })

  it('submits create payload with initialized message list and timestamped note', async () => {
    const savedTicket = {
      id: 't-2',
      customerId: '',
      vesselId: '',
      service_category: 'repair',
      service_title: 'New service',
      status: 'open',
      priority: 'medium',
      createdAt: '2026-07-01T00:00:00.000Z',
      scheduledDate: '2026-07-30',
      notes: '',
    }
    mockedApiFetch.mockImplementation((endpoint) =>
      endpoint === '/assignments/access'
        ? Promise.resolve({ canDelegate: true })
        : endpoint === '/users/assignable'
          ? Promise.resolve([
              {
                id: 'user-1',
                name: 'Taylor Tech',
                email: 'taylor@example.com',
                role: 'technician',
              },
            ])
          : Promise.resolve(savedTicket),
    )

    const wrapper = mount(NewTicket)
    await flushPromises()

    await wrapper.get('input[type="date"]').setValue('2026-07-30')
    await wrapper.get('[data-testid="assignee-select"]').setValue('user-1')
    await wrapper.get('textarea').setValue('Checked bilge and battery wiring')

    const textInputs = wrapper.findAll('input').filter((entry) => {
      const input = entry.element as HTMLInputElement
      return input.type === 'text'
    })
    const serviceTitleInput = textInputs[textInputs.length - 1]
    if (!serviceTitleInput) {
      throw new Error('Expected to find the service title input')
    }
    await serviceTitleInput.setValue('New service')

    await wrapper.get('form').trigger('submit.prevent')
    await flushPromises()

    const createCall = mockedApiFetch.mock.calls.find((call) => call[0] === '/newTicket')
    expect(createCall).toBeTruthy()

    const [, options] = createCall ?? []
    expect(options?.method).toBe('POST')
    const payload = JSON.parse(String(options?.body ?? '{}')) as {
      service_title: string
      notes: string
      messages: unknown[]
      createdAt: string
      assignedUserId: string
    }

    expect(payload.service_title).toBe('New service')
    expect(payload.assignedUserId).toBe('user-1')
    expect(payload.notes).toContain('Checked bilge and battery wiring')
    expect(payload.notes.startsWith('[')).toBe(true)
    expect(Array.isArray(payload.messages)).toBe(true)
    expect(payload.messages).toHaveLength(0)
    expect(new Date(payload.createdAt).toString()).not.toBe('Invalid Date')
  })
})
