import { apiFetch } from '@/services/http/client'

export type AssignmentCard = {
  id: string
  kind: 'ticket' | 'monthlyReport'
  category: 'repair' | 'maintenance' | 'inspection' | 'upgrade' | 'monthlyReport'
  title: string
  synopsis: string
}

export type AssignmentBoardResponse = {
  scope: 'all' | 'assigned'
  tickets: AssignmentCard[]
  monthlyReports: AssignmentCard[]
}

export function fetchAssignmentBoard(): Promise<AssignmentBoardResponse> {
  return apiFetch<AssignmentBoardResponse>('/assignments/board')
}
