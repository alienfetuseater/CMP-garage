import { defineStore } from 'pinia'
import state from './state'
import * as actions from './actions'
import type { MonthlyReport } from '@/types/mock'

export const useMonthlyReportStore = defineStore('monthlyReports', () => {
  const s = state()

  return Object.assign(s, {
    fetchMonthlyReports: (force?: boolean) => actions.fetchMonthlyReports(s, force),
    addReport: (report: MonthlyReport) => actions.addReport(s, report),
    reportById: (id: string) => actions.reportById(s, id),
    reportsForVessel: (vesselId: string) => actions.reportsForVessel(s, vesselId),
  })
})
