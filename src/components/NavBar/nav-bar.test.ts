// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import NavBar from './nav-bar.vue'

const {
  routeState,
  routerPush,
  customerStore,
  vesselStore,
  ticketStore,
  reminderStore,
  authStore,
} = vi.hoisted(() => ({
  routeState: { query: {} as Record<string, string> },
  routerPush: vi.fn(),
  customerStore: { customers: [] as any[] },
  vesselStore: { vessels: [] as any[] },
  ticketStore: { tickets: [] as any[] },
  reminderStore: { reminders: [] as any[] },
  authStore: { user: { id: 'u-1' }, logout: vi.fn() },
}))

vi.mock('vue-router', () => ({
  RouterLink: {
    name: 'RouterLink',
    props: ['to'],
    template: '<a><slot /></a>',
  },
  useRouter: () => ({ push: routerPush }),
  useRoute: () => routeState,
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

vi.mock('@/stores/reminders', () => ({
  useReminderStore: () => reminderStore,
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => authStore,
}))

vi.mock('@/domain/conversations/utils', () => ({
  buildConversationSummary: vi.fn(() => null),
}))

describe('components/NavBar/nav-bar.vue', () => {
  beforeEach(() => {
    routerPush.mockReset()
    authStore.logout.mockReset()
    customerStore.customers = []
    vesselStore.vessels = []
    ticketStore.tickets = []
    reminderStore.reminders = []
  })

  it('searches customers and navigates to customer profile on result click', async () => {
    customerStore.customers = [
      {
        id: 'c-1',
        name: 'Jane Harbor',
        phone: '555-1111',
        email: 'jane@example.com',
        address: 'Dock Street',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ]

    const wrapper = mount(NavBar)
    const input = wrapper.get('input.search-input')

    await input.setValue('jane')
    await input.trigger('focus')

    expect(wrapper.text()).toContain('Customers')
    expect(wrapper.text()).toContain('Jane Harbor')

    await wrapper.get('.search-group .search-item').trigger('click')

    expect(routerPush).toHaveBeenCalledWith({ name: 'CustomerProfile', query: { id: 'c-1' } })
  })

  it('caps reminder badge label at 99+', () => {
    reminderStore.reminders = Array.from({ length: 120 }, (_, index) => ({
      id: `r-${index}`,
      title: `Reminder ${index}`,
      dueDate: '2026-07-01T10:00:00.000Z',
      completed: false,
      notes: '',
      relatedTo: { type: 'other', id: 'other' },
    }))

    const wrapper = mount(NavBar)
    const reminderButton = wrapper.get('button[title="Open Reminders"]')

    expect(reminderButton.text()).toContain('99+')
  })
})
