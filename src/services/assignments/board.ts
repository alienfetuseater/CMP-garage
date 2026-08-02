import { apiFetch } from '@/services/http/client'

export type AssignmentCard = {
  id: string
  kind: 'ticket' | 'monthlyReport' | 'reminder'
  category: 'repair' | 'maintenance' | 'diagnosis' | 'monthlyReport' | 'reminder'
  title: string
  synopsis: string
}

export type AssignmentBoardResponse = {
  scope: 'all' | 'assigned'
  tickets: AssignmentCard[]
  monthlyReports: AssignmentCard[]
  reminders: AssignmentCard[]
}

export function fetchAssignmentBoard(): Promise<AssignmentBoardResponse> {
  return apiFetch<AssignmentBoardResponse>('/assignments/board')
}
