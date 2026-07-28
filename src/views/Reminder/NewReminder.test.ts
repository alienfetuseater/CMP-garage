// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import NewReminder from './NewReminder.vue'

const { routeState, routerPush, routerBack, uiStore, reminderStore, customerStore, vesselStore, ticketStore, mockedApiFetch } =
  vi.hoisted(() => ({
    routeState: { query: {} as Record<string, string> },
    routerPush: vi.fn(),
    routerBack: vi.fn(),
    uiStore: { fetchAllData: vi.fn().mockResolvedValue(undefined) },
    reminderStore: {
      addReminder: vi.fn(),
      reminderById: vi.fn(),
    },
    customerStore: {
      customers: [{ id: 'c-1', name: 'Jane Harbor', phone: '555-1111' }] as any[],
    },
    vesselStore: {
      vessels: [{ id: 'v-1', vesselName: 'Sea Breeze', vesselMake: 'Yamaha', vesselYear: 2022 }] as any[],
    },
    ticketStore: {
      tickets: [{ id: 't-1', service_title: 'Repair', status: 'open' }] as any[],
    },
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

vi.mock('@/stores/ui', () => ({
  useUiStore: () => uiStore,
}))

vi.mock('@/stores/reminders', () => ({
  useReminderStore: () => reminderStore,
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

function flushPromises() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0)
  })
}

describe('views/Reminder/NewReminder.vue', () => {
  beforeEach(() => {
    routeState.query = {}
    routerPush.mockReset()
    routerBack.mockReset()
    mockedApiFetch.mockReset()
    reminderStore.addReminder.mockReset()
    reminderStore.reminderById.mockReset()
    uiStore.fetchAllData.mockClear()
  })

  it('allows "other" related type without selecting a related item', async () => {
    const wrapper = mount(NewReminder)
    await flushPromises()

    const submitButton = wrapper.get('button[type="submit"]')
    expect((submitButton.element as HTMLButtonElement).disabled).toBe(true)

    const relatedTypeSelect = wrapper.get('select')
    await relatedTypeSelect.setValue('other')

    expect(wrapper.text()).toContain('Related item will be saved as "other".')
    expect((submitButton.element as HTMLButtonElement).disabled).toBe(false)
  })

  it('hydrates edit mode from existing reminder', async () => {
    routeState.query = { reminderId: 'r-1', mode: 'edit' }
    reminderStore.reminderById.mockReturnValue({
      id: 'r-1',
      title: 'Follow up call',
      dueDate: '2026-07-25T14:30:00.000Z',
      completed: true,
      notes: 'Existing note',
      relatedTo: { type: 'customer', id: 'c-1' },
    })

    const wrapper = mount(NewReminder)
    await flushPromises()

    expect(uiStore.fetchAllData).toHaveBeenCalled()
    expect(reminderStore.reminderById).toHaveBeenCalledWith('r-1')
    expect(wrapper.text()).toContain('Edit Reminder')
    expect((wrapper.get('input[required]').element as HTMLInputElement).value).toBe('Follow up call')
  })

  it('submits create payload with normalized related type and note history prefix', async () => {
    mockedApiFetch.mockResolvedValue({
      id: 'r-2',
      title: 'Fuel check',
      completed: false,
      notes: '',
      relatedTo: { type: 'other', id: 'other' },
    })

    const wrapper = mount(NewReminder)
    await flushPromises()

    await wrapper.get('input[required]').setValue('Fuel check')
    await wrapper.get('input[type="date"]').setValue('2026-07-30')
    await wrapper.get('input[type="time"]').setValue('09:15')
    await wrapper.get('textarea').setValue('Call marina before departure')
    await wrapper.get('select').setValue('other')
    await wrapper.get('form').trigger('submit.prevent')
    await flushPromises()

    expect(mockedApiFetch).toHaveBeenCalled()
    const [endpoint, options] = mockedApiFetch.mock.calls[0] ?? []
    expect(endpoint).toBe('/newReminder')
    expect(options?.method).toBe('POST')

    const payload = JSON.parse(String(options?.body ?? '{}')) as {
      title: string
      dueDate?: string
      relatedTo: { type: string; id: string }
      notes: string
    }
    expect(payload.title).toBe('Fuel check')
    expect(payload.relatedTo).toEqual({ type: 'other', id: 'other' })
    expect(payload.notes).toContain('Call marina before departure')
    expect(payload.notes.startsWith('[')).toBe(true)
    expect(new Date(String(payload.dueDate)).toISOString().startsWith('2026-07-30')).toBe(true)
  })
})
