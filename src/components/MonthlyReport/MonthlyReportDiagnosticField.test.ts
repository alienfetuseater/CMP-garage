// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import MonthlyReportDiagnosticField from './MonthlyReportDiagnosticField.vue'

describe('MonthlyReportDiagnosticField', () => {
  it('reveals comment and photo controls independently', async () => {
    const wrapper = mount(MonthlyReportDiagnosticField, {
      props: {
        label: 'Engine oil level and condition',
        entry: { value: 'N/A', comment: '', photos: [] },
      },
    })

    expect(wrapper.find('textarea').exists()).toBe(false)
    expect(wrapper.findAll('input[type="file"]')).toHaveLength(0)

    await wrapper.get('button:nth-of-type(1)').trigger('click')
    expect(wrapper.find('textarea').exists()).toBe(true)

    await wrapper.get('button:nth-of-type(2)').trigger('click')
    expect(wrapper.findAll('input[type="file"]')).toHaveLength(2)
  })

  it('shows saved comments and photos without edit buttons in read-only mode', () => {
    const wrapper = mount(MonthlyReportDiagnosticField, {
      props: {
        label: 'Engine oil level and condition',
        readonly: true,
        entry: {
          value: 'monitor',
          comment: 'Check again next month',
          photos: [
            {
              id: 'photo-1',
              name: 'Oil sample',
              uploadedAt: '2026-07-31T12:00:00.000Z',
              dataUrl: 'data:image/jpeg;base64,abc',
            },
          ],
        },
      },
    })

    expect((wrapper.get('textarea').element as HTMLTextAreaElement).value).toBe(
      'Check again next month',
    )
    expect(wrapper.find('img[alt="Oil sample"]').exists()).toBe(true)
    expect(wrapper.findAll('button')).toHaveLength(0)
  })
})
