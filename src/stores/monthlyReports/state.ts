import { reactive } from 'vue'
import type { MonthlyReport } from '@/types/mock'

export type MonthlyReportsState = {
  reports: MonthlyReport[]
}

export default function state(): MonthlyReportsState {
  return reactive({
    reports: [],
  })
}
