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
        category: 'inspection',
        title: 'Pre-launch inspection',
        synopsis: 'Complete the seasonal safety inspection.',
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

it('groups open work into five linked assignment columns', async () => {
  const wrapper = mount(AssignmentBoard, {
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
  await new Promise((resolve) => setTimeout(resolve, 0))

  expect(wrapper.text()).toContain('All open assignments')
  expect(wrapper.findAll('.board-column')).toHaveLength(5)
  expect(wrapper.text()).toContain('Repairs')
  expect(wrapper.text()).toContain('Monthly Reports')
  expect(wrapper.text()).toContain('Maintenance')
  expect(wrapper.text()).toContain('Inspections')
  expect(wrapper.text()).toContain('Upgrades')
  expect(wrapper.text()).toContain('Replace raw-water pump')
  expect(wrapper.text()).toContain('Sea Breeze Monthly Report')

  const links = wrapper.findAllComponents(RouterLinkStub)
  expect(links.map((link) => link.props('to'))).toContainEqual({
    name: 'Ticket',
    query: { id: 'ticket-1' },
  })
  expect(links.map((link) => link.props('to'))).toContainEqual({
    name: 'MonthlyReport',
    query: { id: 'report-1' },
  })
})
