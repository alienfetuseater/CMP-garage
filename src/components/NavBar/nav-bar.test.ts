// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import NavBar from './nav-bar.vue'
import NavActionControl from './NavActionControl.vue'
import type { Customer, Reminder, Ticket, Vessel } from '@/types/mock'

const {
  routeState,
  routerPush,
  customerStore,
  vesselStore,
  ticketStore,
  reminderStore,
  authStore,
  fetchUserAccessMock,
} = vi.hoisted(() => ({
  routeState: { query: {} as Record<string, string> },
  routerPush: vi.fn(),
  customerStore: { customers: [] as Customer[] },
  vesselStore: { vessels: [] as Vessel[] },
  ticketStore: { tickets: [] as Ticket[] },
  reminderStore: { reminders: [] as Reminder[] },
  authStore: { user: { id: 'u-1', role: 'admin' }, logout: vi.fn() },
  fetchUserAccessMock: vi.fn(),
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

vi.mock('@/services/users/accounts', () => ({
  fetchUserAccess: fetchUserAccessMock,
}))

vi.mock('@/domain/conversations/utils', () => ({
  buildConversationSummary: vi.fn(() => null),
}))

describe('components/NavBar/nav-bar.vue', () => {
  beforeEach(() => {
    routerPush.mockReset()
    authStore.logout.mockReset()
    authStore.user.role = 'admin'
    fetchUserAccessMock.mockReset().mockResolvedValue({
      canRead: true,
      canCreate: true,
      canEdit: true,
    })
    customerStore.customers = []
    vesselStore.vessels = []
    ticketStore.tickets = []
    reminderStore.reminders = []
  })

  it('shows authorized users a labeled registered-users link', async () => {
    const wrapper = mount(NavBar)
    await new Promise((resolve) => setTimeout(resolve, 0))

    const usersLink = wrapper.get('[title="Registered Users"]')
    const usersControl = wrapper
      .findAllComponents(NavActionControl)
      .find((control) => control.props('title') === 'Registered Users')
    expect(usersLink.text()).toContain('Users')
    expect(usersControl?.props('to')).toBe('/users')
  })

  it('hides user management navigation from non-privileged users', async () => {
    fetchUserAccessMock.mockRejectedValue(new Error('403 Forbidden'))

    const wrapper = mount(NavBar)
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.find('[title="Registered Users"]').exists()).toBe(false)
    expect(wrapper.find('[title="User Registration"]').exists()).toBe(false)
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
