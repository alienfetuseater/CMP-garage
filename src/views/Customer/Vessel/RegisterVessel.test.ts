// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RegisterVessel from './RegisterVessel.vue'

const {
  routeState,
  routerPush,
  customerStore,
  vesselStore,
  uiStore,
  mockedApiFetch,
} = vi.hoisted(() => ({
  routeState: { query: {} as Record<string, string> },
  routerPush: vi.fn(),
  customerStore: { fetchCustomers: vi.fn() },
  vesselStore: { addVessel: vi.fn(), vesselById: vi.fn() },
  uiStore: { fetchAllData: vi.fn().mockResolvedValue(undefined) },
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

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

describe('views/Customer/Vessel/RegisterVessel.vue', () => {
  beforeEach(() => {
    routeState.query = {}
    routerPush.mockReset()
    customerStore.fetchCustomers.mockReset()
    vesselStore.addVessel.mockReset()
    vesselStore.vesselById.mockReset()
    uiStore.fetchAllData.mockClear()
    mockedApiFetch.mockReset()
  })

  it('renders the vessel registration form', async () => {
    customerStore.fetchCustomers.mockResolvedValue([{ id: 'c-1', name: 'Jane', phone: '123' }])

    const wrapper = mount(RegisterVessel)
    await flushPromises()

    expect(wrapper.text()).toContain('Register Vessel')
    expect(wrapper.text()).toContain('Vessel Name')
  })

  it('submits a create payload for a new vessel', async () => {
    customerStore.fetchCustomers.mockResolvedValue([{ id: 'c-1', name: 'Jane', phone: '123' }])
    mockedApiFetch.mockResolvedValue({ id: 'v-1' })
    routeState.query = { ownerId: 'c-1' }

    const wrapper = mount(RegisterVessel)
    await flushPromises()

    const visibleInputs = wrapper.findAll('input').filter((entry) => entry.element.type !== 'file')
    const selects = wrapper.findAll('select')
    expect(selects.length).toBeGreaterThanOrEqual(4)

    const vesselNameInput = visibleInputs.at(0)
    expect(vesselNameInput).toBeTruthy()
    if (!vesselNameInput) {
      throw new Error('Expected vessel name input to be rendered')
    }

    const makeSelect = selects.at(0)
    const engineSelect = selects.at(3)
    expect(makeSelect).toBeTruthy()
    expect(engineSelect).toBeTruthy()
    if (!makeSelect || !engineSelect) {
      throw new Error('Expected vessel and engine select inputs to be rendered')
    }

    await vesselNameInput.setValue('Sea Breeze')
    await makeSelect.setValue('Boston Whaler')
    await engineSelect.setValue('Yamaha')

    await wrapper.get('form').trigger('submit.prevent')
    await flushPromises()

    expect(mockedApiFetch).toHaveBeenCalledWith('/newBoat', expect.objectContaining({ method: 'POST' }))
    const newBoatCall = mockedApiFetch.mock.calls.find((call) => call[0] === '/newBoat')
    expect(newBoatCall).toBeTruthy()
    if (!newBoatCall) {
      throw new Error('Expected /newBoat request to be made')
    }
    const [, options] = newBoatCall
    const payload = JSON.parse(String(options?.body ?? '{}')) as {
      customerId: string
      vesselName: string
      vesselMake: string
      engineMake: string
    }

    expect(payload.customerId).toBe('c-1')
    expect(payload.vesselName).toBe('Sea Breeze')
    expect(payload.vesselMake).toBe('Boston Whaler')
    expect(payload.engineMake).toBe('Yamaha')
  })
})
