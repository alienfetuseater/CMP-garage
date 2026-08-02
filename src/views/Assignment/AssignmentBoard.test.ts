// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AssignmentBoard from './AssignmentBoard.vue'

const { fetchAssignmentBoardMock } = vi.hoisted(() => ({
  fetchAssignmentBoardMock: vi.fn().mockResolvedValue({
    scope: 'all',
    tickets: [
      {
        id: 'ticket-1',
        kind: 'ticket',
        category: 'repair',
        title: 'Replace raw-water pump',
        synopsis: 'Inspect the cooling system and replace the failed pump.',
      },
      {
        id: 'ticket-2',
        kind: 'ticket',
        category: 'maintenance',
        title: 'Annual engine service',
        synopsis: 'Complete scheduled engine maintenance.',
      },
      {
        id: 'ticket-3',
        kind: 'ticket',
        category: 'diagnosis',
        title: 'Trace intermittent alarm',
        synopsis: 'Diagnose the intermittent engine alarm.',
      },
    ],
    monthlyReports: [
      {
        id: 'report-1',
        kind: 'monthlyReport',
        category: 'monthlyReport',
        title: 'Sea Breeze Monthly Report',
        synopsis: 'Complete the monthly report for Sea Breeze.',
      },
    ],
    reminders: [
      {
        id: 'reminder-1',
        kind: 'reminder',
        category: 'reminder',
        title: 'Call owner with estimate',
        synopsis: 'Follow up before ordering parts.',
      },
    ],
  }),
}))

vi.mock('@/services/assignments/board', () => ({
  fetchAssignmentBoard: fetchAssignmentBoardMock,
}))

const RouterLinkStub = {
  name: 'RouterLink',
  props: ['to'],
  template: '<a><slot /></a>',
}

it('groups color-coded work and reminders into four linked assignment columns', async () => {
  const wrapper = mount(AssignmentBoard, {
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
  await new Promise((resolve) => setTimeout(resolve, 0))

  expect(wrapper.text()).toContain('All open work assignments and your reminders')
  expect(wrapper.findAll('.board-column')).toHaveLength(4)
  expect(wrapper.text()).toContain('Service Work')
  expect(wrapper.text()).toContain('Monthly Reports')
  expect(wrapper.text()).toContain('Diagnosis')
  expect(wrapper.text()).toContain('Reminders')
  expect(wrapper.text()).not.toContain('Modifications')
  expect(wrapper.text()).not.toContain('Inspections')
  expect(wrapper.text()).not.toContain('Upgrades')
  expect(wrapper.text()).toContain('Replace raw-water pump')
  expect(wrapper.text()).toContain('Annual engine service')
  expect(wrapper.text()).toContain('Trace intermittent alarm')
  expect(wrapper.text()).toContain('Sea Breeze Monthly Report')
  expect(wrapper.text()).toContain('Call owner with estimate')
  expect(wrapper.findAll('.card-repair')).toHaveLength(1)
  expect(wrapper.findAll('.card-maintenance')).toHaveLength(1)
  expect(wrapper.findAll('.card-diagnosis')).toHaveLength(1)
  expect(wrapper.findAll('.card-monthlyReport')).toHaveLength(1)
  expect(wrapper.findAll('.card-reminder')).toHaveLength(1)

  const links = wrapper.findAllComponents(RouterLinkStub)
  expect(links.map((link) => link.props('to'))).toContainEqual({
    name: 'Ticket',
    query: { id: 'ticket-1' },
  })
  expect(links.map((link) => link.props('to'))).toContainEqual({
    name: 'MonthlyReport',
    query: { id: 'report-1' },
  })
  expect(links.map((link) => link.props('to'))).toContainEqual({
    name: 'Reminder',
    query: { id: 'reminder-1' },
  })
})
