import { describe, expect, it } from 'vitest'
import {
  createMonthlyReportDiagnostics,
  isMonthlyReportDiagnosticField,
  monthlyReportDiagnosticFields,
} from './diagnostics'

describe('monthly report diagnostics', () => {
  it('initializes every field to N/A while preserving recorded values', () => {
    const diagnostics = createMonthlyReportDiagnostics({ engine_oil: 'action' })

    expect(Object.keys(diagnostics)).toHaveLength(monthlyReportDiagnosticFields.length)
    expect(diagnostics.engine_oil).toEqual({ value: 'action', comment: '', photos: [] })
    expect(diagnostics.gear_lube).toEqual({ value: 'N/A', comment: '', photos: [] })
  })

  it('preserves comments and clones photo attachments', () => {
    const photo = {
      id: 'photo-1',
      name: 'Oil sample',
      uploadedAt: '2026-07-31T12:00:00.000Z',
      dataUrl: 'data:image/jpeg;base64,abc',
    }
    const diagnostics = createMonthlyReportDiagnostics({
      engine_oil: { value: 'monitor', comment: 'Check next month', photos: [photo] },
    })

    expect(diagnostics.engine_oil).toEqual({
      value: 'monitor',
      comment: 'Check next month',
      photos: [photo],
    })
    expect(diagnostics.engine_oil?.photos[0]).not.toBe(photo)
  })

  it('recognizes only configured diagnostic keys', () => {
    expect(isMonthlyReportDiagnosticField('engine_oil')).toBe(true)
    expect(isMonthlyReportDiagnosticField('retired_field')).toBe(false)
  })
})
