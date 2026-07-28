// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeCalender from './home-calender.vue'

describe('components/Calender/home-calender.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-15T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('emits selected day on mount', () => {
    const wrapper = mount(HomeCalender, {
      props: {
        reminders: [],
        tickets: [],
      },
    })

    const emitted = wrapper.emitted('select-date')
    expect(emitted).toBeTruthy()
    expect(emitted?.[0]?.[0]).toEqual({
      date: '2026-07-15',
      reminders: [],
      tickets: [],
    })
  })

  it('emits select-date and double-click-date for an in-month cell', async () => {
    const reminder = {
      id: 'r-1',
      title: 'Reminder',
      dueDate: '2026-07-20T09:00:00.000Z',
      completed: false,
      notes: '',
      relatedTo: { type: 'other' as const, id: 'other' },
    }

    const ticket = {
      id: 't-1',
      customerId: 'c-1',
      vesselId: 'v-1',
      service_category: 'repair' as const,
      service_title: 'Ticket',
      status: 'open' as const,
      priority: 'medium' as const,
      createdAt: '2026-07-01T00:00:00.000Z',
      scheduledDate: '2026-07-20T11:00:00.000Z',
      notes: '',
    }

    const wrapper = mount(HomeCalender, {
      props: {
        reminders: [reminder],
        tickets: [ticket],
      },
    })

    const dayCell = wrapper
      .findAll('.day-cell.clickable')
      .find((cell) => cell.find('.day-number').text().trim() === '20')
    expect(dayCell).toBeTruthy()

    await dayCell!.trigger('click')

    const selectEvents = wrapper.emitted('select-date') ?? []
    const lastSelectPayload = selectEvents[selectEvents.length - 1]?.[0] as {
      date: string
      reminders: unknown[]
      tickets: unknown[]
    }

    expect(lastSelectPayload.date).toBe('2026-07-20')
    expect(lastSelectPayload.reminders).toHaveLength(1)
    expect(lastSelectPayload.tickets).toHaveLength(1)

    await dayCell!.trigger('dblclick')
    const dblEvents = wrapper.emitted('double-click-date') ?? []
    expect(dblEvents[dblEvents.length - 1]?.[0]).toEqual({ date: '2026-07-20' })
  })
})
