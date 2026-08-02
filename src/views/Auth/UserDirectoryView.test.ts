// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import UserDirectoryView from './UserDirectoryView.vue'

const {
  authStore,
  fetchUserAccessMock,
  fetchUserAssignedTicketsMock,
  fetchUsersMock,
  updateUserMock,
  routerPush,
} = vi.hoisted(() => ({
  authStore: {
    user: {
      id: 'current-user',
      name: 'Current User',
      email: 'current@example.com',
      role: 'serviceManager' as 'admin' | 'serviceManager',
    },
  },
  fetchUserAccessMock: vi.fn(),
  fetchUserAssignedTicketsMock: vi.fn(),
  fetchUsersMock: vi.fn(),
  updateUserMock: vi.fn(),
  routerPush: vi.fn(),
}))

vi.mock('@/stores/auth', () => ({ useAuthStore: () => authStore }))
vi.mock('vue-router', () => ({ useRouter: () => ({ push: routerPush }) }))
vi.mock('@/services/users/accounts', () => ({
  fetchUserAccess: fetchUserAccessMock,
  fetchUserAssignedTickets: fetchUserAssignedTicketsMock,
  fetchUsers: fetchUsersMock,
  updateUser: updateUserMock,
}))

const registeredUser = {
  id: 'user-2',
  name: 'Taylor Tech',
  email: 'taylor@example.com',
  role: 'technician' as const,
}

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

describe('views/Auth/UserDirectoryView.vue', () => {
  beforeEach(() => {
    authStore.user.role = 'serviceManager'
    fetchUserAccessMock.mockReset().mockResolvedValue({
      canRead: true,
      canCreate: true,
      canEdit: false,
    })
    fetchUsersMock.mockReset().mockResolvedValue([registeredUser])
    fetchUserAssignedTicketsMock.mockReset().mockResolvedValue([])
    updateUserMock.mockReset()
    routerPush.mockReset()
  })

  it('shows supervisors the directory without profile editing controls', async () => {
    const wrapper = mount(UserDirectoryView)
    await flushPromises()

    expect(wrapper.text()).toContain('Taylor Tech')
    expect(wrapper.text()).toContain('Technician')
    expect(wrapper.text()).toContain('Add User')
    expect(wrapper.text()).not.toContain('Edit')
  })

  it('allows administrators to edit a registered user profile', async () => {
    authStore.user.role = 'admin'
    fetchUserAccessMock.mockResolvedValue({
      canRead: true,
      canCreate: true,
      canEdit: true,
    })
    updateUserMock.mockResolvedValue({
      ...registeredUser,
      name: 'Taylor Marine',
      role: 'coordinator',
    })

    const wrapper = mount(UserDirectoryView)
    await flushPromises()
    await wrapper.get('button.secondary').trigger('click')
    await wrapper.get('input[aria-label="User name"]').setValue('Taylor Marine')
    await wrapper.get('select[aria-label="User role"]').setValue('coordinator')
    await wrapper.get('button.primary').trigger('click')
    await flushPromises()

    expect(updateUserMock).toHaveBeenCalledWith('user-2', {
      name: 'Taylor Marine',
      email: 'taylor@example.com',
      role: 'coordinator',
    })
    expect(wrapper.text()).toContain("Taylor Marine's profile was updated.")
  })

  it('expands a user profile to show and open assigned tickets', async () => {
    fetchUserAssignedTicketsMock.mockResolvedValue([
      {
        id: 'ticket-1',
        title: 'Replace raw-water pump',
        category: 'repair',
        status: 'in progress',
        priority: 'high',
        scheduledDate: '2026-08-05T12:00:00.000Z',
      },
    ])

    const wrapper = mount(UserDirectoryView)
    await flushPromises()
    await wrapper.get('.profile-toggle').trigger('click')
    await flushPromises()

    expect(fetchUserAssignedTicketsMock).toHaveBeenCalledWith('user-2')
    expect(wrapper.text()).toContain('Assigned Tickets')
    expect(wrapper.text()).toContain('Replace raw-water pump')
    expect(wrapper.text()).toContain('Repair · high priority')

    await wrapper.get('.assigned-ticket').trigger('click')
    expect(routerPush).toHaveBeenCalledWith({ name: 'Ticket', query: { id: 'ticket-1' } })
  })
})
