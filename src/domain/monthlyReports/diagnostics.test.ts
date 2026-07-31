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
    expect(diagnostics.engine_oil).toBe('action')
    expect(diagnostics.gear_lube).toBe('N/A')
  })

  it('recognizes only configured diagnostic keys', () => {
    expect(isMonthlyReportDiagnosticField('engine_oil')).toBe(true)
    expect(isMonthlyReportDiagnosticField('retired_field')).toBe(false)
  })
})
