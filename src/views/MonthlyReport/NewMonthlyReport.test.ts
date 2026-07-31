// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import NewMonthlyReport from './NewMonthlyReport.vue'

const { routeState, routerPush, routerBack, reportStore, uiStore, mockedApiFetch } = vi.hoisted(
  () => ({
    routeState: { query: {} as Record<string, string> },
    routerPush: vi.fn(),
    routerBack: vi.fn(),
    reportStore: { addReport: vi.fn() },
    uiStore: { fetchAllData: vi.fn().mockResolvedValue(undefined) },
    mockedApiFetch: vi.fn(),
  }),
)

vi.mock('vue-router', () => ({
  useRoute: () => routeState,
  useRouter: () => ({ push: routerPush, back: routerBack }),
}))

vi.mock('@/services/http/client', () => ({ apiFetch: mockedApiFetch }))
vi.mock('@/stores/monthlyReports', () => ({ useMonthlyReportStore: () => reportStore }))
vi.mock('@/stores/ui', () => ({ useUiStore: () => uiStore }))

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

describe('views/MonthlyReport/NewMonthlyReport.vue', () => {
  beforeEach(() => {
    routeState.query = {
      customerId: 'c-1',
      vesselId: 'v-1',
      customerName: 'Jane Harbor',
      vesselName: 'Sea Breeze',
    }
    routerPush.mockReset()
    routerBack.mockReset()
    reportStore.addReport.mockReset()
    uiStore.fetchAllData.mockClear()
    mockedApiFetch.mockReset()
  })

  it('renders diagnostic attachment controls before the monthly summary', async () => {
    const wrapper = mount(NewMonthlyReport)
    await flushPromises()

    expect(wrapper.text()).toContain('Customer Name')
    expect(wrapper.text()).toContain('Vessel Name')
    expect(wrapper.text()).toContain('Report Date')
    expect(wrapper.text()).toContain('Diagnostics')
    expect(wrapper.text()).toContain('Add Comment')
    expect(wrapper.text()).toContain('Add Photo')
    expect(wrapper.text()).toContain('Summary of Monthly Report')
    expect(wrapper.text().indexOf('Diagnostics')).toBeLessThan(
      wrapper.text().indexOf('Summary of Monthly Report'),
    )
    expect(wrapper.text()).not.toContain('Priority')
    expect(wrapper.text()).not.toContain('Report Title')
    expect(wrapper.text()).not.toContain('Initial Assessment')
    expect(wrapper.text()).not.toContain('Plan of Action')
    expect(wrapper.text()).not.toContain('Required Parts')
  })

  it('submits only retained report fields with N/A diagnostic defaults', async () => {
    mockedApiFetch.mockResolvedValue({
      id: 'mr-1',
      customerId: 'c-1',
      vesselId: 'v-1',
      customerName: 'Jane Harbor',
      vesselName: 'Sea Breeze',
      reportDate: '2026-07-31',
      createdAt: '2026-07-31T12:00:00.000Z',
      notes: '',
      diagnostics: {},
    })

    const wrapper = mount(NewMonthlyReport)
    await flushPromises()
    await wrapper.get('input[type="date"]').setValue('2026-07-31')
    await wrapper.get('textarea').setValue('Monthly inspection completed')
    await wrapper.get('form').trigger('submit.prevent')
    await flushPromises()

    const [, options] =
      mockedApiFetch.mock.calls.find((call) => call[0] === '/newMonthlyReport') ?? []
    const payload = JSON.parse(String(options?.body ?? '{}'))

    expect(Object.keys(payload).sort()).toEqual(
      [
        'createdAt',
        'customerId',
        'customerName',
        'diagnostics',
        'notes',
        'reportDate',
        'vesselId',
        'vesselName',
      ].sort(),
    )
    expect(payload.reportDate).toBe('2026-07-31')
    expect(payload.notes).toContain('Monthly inspection completed')
    expect(payload.diagnostics.engine_oil).toEqual({ value: 'N/A', comment: '', photos: [] })
    expect(routerPush).toHaveBeenCalledWith({ name: 'MonthlyReport', query: { id: 'mr-1' } })
  })
})
