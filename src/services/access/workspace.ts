import { apiFetch } from '@/services/http/client'

export type WorkspaceAccess = {
  canRegisterCustomers: boolean
  canViewDirectory: boolean
  canUseSearch: boolean
  canManageCustomers: boolean
  canManageVessels: boolean
  canViewReminders: boolean
  canManageReminders: boolean
  canViewOpenTicketList: boolean
  canCreateTickets: boolean
  canCreateReports: boolean
}

export function fetchWorkspaceAccess(): Promise<WorkspaceAccess> {
  return apiFetch<WorkspaceAccess>('/workspace/access')
}
