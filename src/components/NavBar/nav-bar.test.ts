// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import NavBar from './nav-bar.vue'
import NavActionControl from './NavActionControl.vue'
import AdminNavRail from './AdminNavRail.vue'
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
  fetchAssignmentBoardAccessMock,
  fetchWorkspaceAccessMock,
} = vi.hoisted(() => ({
  routeState: { query: {} as Record<string, string> },
  routerPush: vi.fn(),
  customerStore: { customers: [] as Customer[] },
  vesselStore: { vessels: [] as Vessel[] },
  ticketStore: { tickets: [] as Ticket[] },
  reminderStore: { reminders: [] as Reminder[] },
  authStore: { user: { id: 'u-1', role: 'admin' }, logout: vi.fn() },
  fetchUserAccessMock: vi.fn(),
  fetchAssignmentBoardAccessMock: vi.fn(),
  fetchWorkspaceAccessMock: vi.fn(),
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
  fetchAssignmentBoardAccess: fetchAssignmentBoardAccessMock,
}))

vi.mock('@/services/access/workspace', () => ({
  fetchWorkspaceAccess: fetchWorkspaceAccessMock,
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
    fetchAssignmentBoardAccessMock.mockReset().mockResolvedValue({ canView: true })
    fetchWorkspaceAccessMock.mockReset().mockResolvedValue({
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
    customerStore.customers = []
    vesselStore.vessels = []
    ticketStore.tickets = []
    reminderStore.reminders = []
  })

  it('uses a static logo and a calendar action for home navigation', async () => {
    const wrapper = mount(NavBar)
    await new Promise((resolve) => setTimeout(resolve, 0))

    const logo = wrapper.get('img.nav-logo')
    const calendarControl = wrapper
      .findAllComponents(NavActionControl)
      .find((control) => control.props('title') === 'Calendar')

    expect(logo.element.closest('a, button')).toBeNull()
    expect(calendarControl?.props('to')).toBe('/')

    await wrapper.get('button[aria-label="Open navigation menu"]').trigger('click')
    expect(wrapper.text()).toContain('Calendar')
  })

  it('puts Logout at the far left and management links in the right rail', async () => {
    const wrapper = mount(NavBar)
    await new Promise((resolve) => setTimeout(resolve, 0))

    const brandRow = wrapper.get('.top-nav nav li')
    const adminRail = wrapper.getComponent(AdminNavRail)

    expect(brandRow.element.firstElementChild?.getAttribute('title')).toBe('Logout')
    expect(wrapper.find('.action-icons [title="Client Registration"]').exists()).toBe(false)
    expect(wrapper.find('.action-icons [title="Client Directory"]').exists()).toBe(false)
    expect(wrapper.find('.action-icons [title="Employee Registration"]').exists()).toBe(false)
    expect(wrapper.find('.action-icons [title="Employee Directory"]').exists()).toBe(false)
    expect(adminRail.props()).toMatchObject({
      showCustomerRegistration: true,
      showDirectory: true,
      showUserManagement: true,
    })
  })

  it('separates navigation actions from right-aligned notification actions', async () => {
    const wrapper = mount(NavBar)
    await new Promise((resolve) => setTimeout(resolve, 0))

    const navigationIcons = wrapper.get('.navigation-icons')
    const notificationIcons = wrapper.get('.notification-icons')

    expect(navigationIcons.find('[title="Calendar"]').exists()).toBe(true)
    expect(navigationIcons.find('[title="Assignment Board"]').exists()).toBe(true)
    expect(navigationIcons.find('[title="Team Messages"]').exists()).toBe(false)
    expect(notificationIcons.find('[title="Team Messages"]').exists()).toBe(true)
    expect(notificationIcons.find('[title="Open Reminders"]').exists()).toBe(true)
    expect(notificationIcons.find('[title="Open Tickets"]').exists()).toBe(true)
  })

  it('shows coordinators only the management links allowed by server capabilities', async () => {
    authStore.user.role = 'coordinator'
    fetchUserAccessMock.mockRejectedValue(new Error('403 Forbidden'))

    const wrapper = mount(NavBar)
    await new Promise((resolve) => setTimeout(resolve, 0))

    const adminRail = wrapper.getComponent(AdminNavRail)
    expect(adminRail.find('[title="Client Registration"]').exists()).toBe(true)
    expect(adminRail.find('[title="Client Directory"]').exists()).toBe(true)
    expect(adminRail.find('[title="Employee Registration"]').exists()).toBe(false)
    expect(adminRail.find('[title="Employee Directory"]').exists()).toBe(false)
  })

  it('uses server capabilities rather than the local role label to show the rail', async () => {
    authStore.user.role = 'viewer'

    const wrapper = mount(NavBar)
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.findComponent(AdminNavRail).exists()).toBe(true)
  })

  it('shows authorized users an icon-only employee directory link', async () => {
    const wrapper = mount(NavBar)
    await new Promise((resolve) => setTimeout(resolve, 0))

    const usersLink = wrapper.get('[title="Employee Directory"]')
    const usersControl = wrapper
      .findAllComponents(NavActionControl)
      .find((control) => control.props('title') === 'Employee Directory')
    expect(usersLink.text()).toBe('')
    expect(usersLink.attributes('aria-label')).toBe('Employee Directory')
    expect(usersControl?.props('to')).toBe('/users')
  })

  it('shows the assignment board to users with board access', async () => {
    const wrapper = mount(NavBar)
    await new Promise((resolve) => setTimeout(resolve, 0))

    const boardControl = wrapper
      .findAllComponents(NavActionControl)
      .find((control) => control.props('title') === 'Assignment Board')
    expect(boardControl?.props('to')).toBe('/assignments')
  })

  it('hides customer registration, reminders, and open tickets when access is denied', async () => {
    fetchWorkspaceAccessMock.mockResolvedValue({
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

    const wrapper = mount(NavBar)
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.find('[title="Client Registration"]').exists()).toBe(false)
    expect(wrapper.find('[title="Open Reminders"]').exists()).toBe(false)
    expect(wrapper.find('[title="Open Tickets"]').exists()).toBe(false)
    expect(wrapper.find('input.search-input').exists()).toBe(false)
    expect(wrapper.find('[title="Directory"]').exists()).toBe(false)
    expect(wrapper.find('[title="Assignment Board"]').exists()).toBe(true)
  })

  it('keeps reminder and assigned-ticket icons visible for technicians', async () => {
    fetchWorkspaceAccessMock.mockResolvedValue({
      canRegisterCustomers: false,
      canViewDirectory: false,
      canUseSearch: false,
      canManageCustomers: false,
      canManageVessels: false,
      canViewReminders: true,
      canManageReminders: true,
      canViewOpenTicketList: true,
      canCreateTickets: false,
      canCreateReports: false,
    })

    const wrapper = mount(NavBar)
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.find('[title="Open Reminders"]').exists()).toBe(true)
    expect(wrapper.find('[title="Open Tickets"]').exists()).toBe(true)
    expect(wrapper.find('input.search-input').exists()).toBe(false)
    expect(wrapper.find('[title="Directory"]').exists()).toBe(false)
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
    await new Promise((resolve) => setTimeout(resolve, 0))
    const input = wrapper.get('input.search-input')

    await input.setValue('jane')
    await input.trigger('focus')

    expect(wrapper.text()).toContain('Customers')
    expect(wrapper.text()).toContain('Jane Harbor')

    await wrapper.get('.search-group .search-item').trigger('click')

    expect(routerPush).toHaveBeenCalledWith({ name: 'CustomerProfile', query: { id: 'c-1' } })
  })

  it('caps reminder badge label at 99+', async () => {
    reminderStore.reminders = Array.from({ length: 120 }, (_, index) => ({
      id: `r-${index}`,
      title: `Reminder ${index}`,
      dueDate: '2026-07-01T10:00:00.000Z',
      completed: false,
      notes: '',
      relatedTo: { type: 'other', id: 'other' },
    }))

    const wrapper = mount(NavBar)
    await new Promise((resolve) => setTimeout(resolve, 0))
    const reminderButton = wrapper.get('button[title="Open Reminders"]')

    expect(reminderButton.text()).toContain('99+')
  })
})
