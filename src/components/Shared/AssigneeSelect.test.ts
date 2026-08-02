// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AssigneeSelect from './AssigneeSelect.vue'

const { fetchAssignableUsersMock } = vi.hoisted(() => ({
  fetchAssignableUsersMock: vi.fn().mockResolvedValue([
    {
      id: 'user-1',
      name: 'Taylor Tech',
      email: 'taylor@example.com',
      role: 'technician',
    },
  ]),
}))

vi.mock('@/services/users/accounts', () => ({
  fetchAssignableUsers: fetchAssignableUsersMock,
}))

it('lists registered users and emits the selected assignee id', async () => {
  const wrapper = mount(AssigneeSelect, { props: { modelValue: '' } })
  await new Promise((resolve) => setTimeout(resolve, 0))

  expect(wrapper.text()).toContain('Taylor Tech · Technician')
  expect(wrapper.text()).toContain('Unassigned')

  await wrapper.get('select').setValue('user-1')
  expect(wrapper.emitted('update:modelValue')).toEqual([['user-1']])
})
