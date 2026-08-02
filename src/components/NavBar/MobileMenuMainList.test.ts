// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import MobileMenuMainList from './MobileMenuMainList.vue'

const mountMenu = (overrides: Record<string, boolean> = {}) =>
  mount(MobileMenuMainList, {
    props: {
      showUserManagement: false,
      showAssignmentBoard: false,
      showCustomerRegistration: false,
      showReminders: false,
      showOpenTickets: false,
      showDirectory: false,
      messageBadgeCountLabel: '0',
      badgeCountLabel: '0',
      ticketBadgeCountLabel: '0',
      ...overrides,
    },
  })

const buttonLabels = (wrapper: ReturnType<typeof mountMenu>) =>
  wrapper.findAll('button').map((button) => button.text().replace(/\s+/g, ' ').trim())

describe('MobileMenuMainList', () => {
  it('keeps general message controls visible when workspace controls are denied', () => {
    const labels = buttonLabels(mountMenu())

    expect(labels).toContain('Team Messages 0')
    expect(labels).toContain('Archived Conversations')
    expect(labels).not.toContain('Directory')
    expect(labels).not.toContain('Reminders 0')
    expect(labels).not.toContain('Tickets 0')
  })

  it('uses each workspace capability for its matching control', () => {
    const labels = buttonLabels(
      mountMenu({ showDirectory: true, showReminders: true, showOpenTickets: true }),
    )

    expect(labels).toContain('Directory')
    expect(labels).toContain('Reminders 0')
    expect(labels).toContain('Tickets 0')
  })
})
