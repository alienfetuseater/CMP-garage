// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RegisterVessel from './RegisterVessel.vue'

const { routeState, routerPush, customerStore, vesselStore, uiStore, mockedApiFetch } = vi.hoisted(
  () => ({
    routeState: { query: {} as Record<string, string> },
    routerPush: vi.fn(),
    customerStore: { fetchCustomers: vi.fn() },
    vesselStore: { addVessel: vi.fn(), vesselById: vi.fn() },
    uiStore: { fetchAllData: vi.fn().mockResolvedValue(undefined) },
    mockedApiFetch: vi.fn(),
  }),
)

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

function fieldByLabel(wrapper: ReturnType<typeof mount>, label: string) {
  const field = wrapper.findAll('label').find((entry) => entry.text().includes(label))
  if (!field) throw new Error(`Expected ${label} field to be rendered`)
  return field
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

    await fieldByLabel(wrapper, 'Vessel Name').get('input').setValue('Sea Breeze')
    await fieldByLabel(wrapper, 'Make').get('select').setValue('Boston Whaler')
    await fieldByLabel(wrapper, 'Number of Engines').get('input').setValue('2')
    await flushPromises()
    await fieldByLabel(wrapper, 'Engine Fuel Type').get('select').setValue('diesel')
    await fieldByLabel(wrapper, 'Engine Installation').get('select').setValue('inboard')
    await fieldByLabel(wrapper, 'Engine Make').get('select').setValue('Yamaha')

    const engineSerialInputs = wrapper.findAll('input[placeholder="Enter serial number"]')
    await engineSerialInputs[0]!.setValue('ENGINE-1')
    await engineSerialInputs[1]!.setValue('ENGINE-2')

    await fieldByLabel(wrapper, 'Generator').get('select').setValue('yes')
    await flushPromises()
    await fieldByLabel(wrapper, 'Number of Generators').get('input').setValue('2')
    await flushPromises()

    const allSerialInputs = wrapper.findAll('input[placeholder="Enter serial number"]')
    await allSerialInputs[2]!.setValue('GENERATOR-1')
    await allSerialInputs[3]!.setValue('GENERATOR-2')

    await wrapper.get('form').trigger('submit.prevent')
    await flushPromises()

    expect(mockedApiFetch).toHaveBeenCalledWith(
      '/newBoat',
      expect.objectContaining({ method: 'POST' }),
    )
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
      engineSerialNumbers: string[]
      engineFuelType: string
      engineInstallationType: string
      generatorCount: number
      generatorSerialNumbers: string[]
    }

    expect(payload.customerId).toBe('c-1')
    expect(payload.vesselName).toBe('Sea Breeze')
    expect(payload.vesselMake).toBe('Boston Whaler')
    expect(payload.engineMake).toBe('Yamaha')
    expect(payload.engineSerialNumbers).toEqual(['ENGINE-1', 'ENGINE-2'])
    expect(payload.engineFuelType).toBe('diesel')
    expect(payload.engineInstallationType).toBe('inboard')
    expect(payload.generatorCount).toBe(2)
    expect(payload.generatorSerialNumbers).toEqual(['GENERATOR-1', 'GENERATOR-2'])
  })
})
