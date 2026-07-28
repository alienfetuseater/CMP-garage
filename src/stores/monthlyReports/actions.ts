import { apiFetch } from '@/services/http/client'
import type { MonthlyReport } from '@/types/mock'
import type { MonthlyReportsState } from './state'
import { findById, replaceCollection, resolveRecordId, upsertById } from '@/stores/shared/records'

type MonthlyReportApiRecord = MonthlyReport & { _id?: string }

const normalizeReport = (record: MonthlyReportApiRecord): MonthlyReport => ({
  ...record,
  id: resolveRecordId(record),
})

export const fetchMonthlyReports = async (state: MonthlyReportsState, force = false) => {
  if (!force && state.reports.length > 0) return state.reports
  const data = await apiFetch<MonthlyReportApiRecord[]>('/getAllMonthlyReports')
  const normalized = data.map(normalizeReport)
  replaceCollection(state.reports, normalized)
  return state.reports
}

export const addReport = (state: MonthlyReportsState, report: MonthlyReport) => {
  upsertById(state.reports, normalizeReport(report))
}

export const reportById = (state: MonthlyReportsState, id: string) => {
  return findById(state.reports, id)
}

export const reportsForVessel = (state: MonthlyReportsState, vesselId: string) => {
  return state.reports.filter((r) => r.vesselId === vesselId)
}
