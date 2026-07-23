export interface Customer {
  id: string
  name: string
  phone: string
  email: string
  address: string
  createdAt: string
  vesselIds?: string[]
}

export interface Vessel {
  id: string
  customerId: string
  owner?: string
  customerName: string
  customerPhone: string
  vesselName: string
  vesselMake: string
  vesselYear: number
  hullIdNumber: string
  numberOfEngines: number
  engineSerialNumbers: string[]
  generator: boolean
  boatLocation: 'trailor' | 'slip' | 'dry dock' | ''
  engineMake: string
  engineModel: string
  engineHorsepower: number
  engineHours: number
}

export interface ReminderRelated {
  type: 'customer' | 'vessel' | 'ticket' | 'other'
  id: string
}

export interface Reminder {
  id: string
  title: string
  dueDate?: string
  completed: boolean
  notes: string
  relatedTo: ReminderRelated
}

export type TicketStatus = 'open' | 'in progress' | 'completed' | 'closed' | 'cancelled' | 'on hold'

export type TicketPriority = 'low' | 'medium' | 'high'

export type ServiceCategory = 'inspection' | 'repair' | 'maintenance' | 'upgrade'

export type DiagnosticLevel = 'good' | 'monitor' | 'action' | 'N/A'
export type TicketDiagnostics = Record<string, DiagnosticLevel>

export interface PlanActionItem {
  id: string
  text: string
  completed: boolean
}

export interface RequiredPartItem {
  id: string
  text: string
  completed: boolean
  cost?: number
}

export interface TicketPhotoAttachment {
  id: string
  name: string
  uploadedAt: string
  dataUrl: string
}

export interface Ticket {
  id: string
  customerId: string
  vesselId: string
  customerName?: string
  vesselName?: string
  service_category: ServiceCategory
  service_title: string
  status: TicketStatus
  priority: TicketPriority
  createdAt: string
  scheduledDate: string
  notes: string
  initialAssessment?: string
  initialAssessmentPhotos?: TicketPhotoAttachment[]
  recommendedService?: string
  summaryOfWorkPerformed?: string
  summaryOfWorkPerformedPhotos?: TicketPhotoAttachment[]
  laborCost?: number
  summaryOfFurtherRecommendations?: string
  planOfAction?: PlanActionItem[]
  requiredParts?: RequiredPartItem[]
  messages?: Message[]
  diagnostics?: TicketDiagnostics
}

export interface ReminderDisplayItem {
  id: string
  title: string
  date: string
  completed: boolean
  status: string
  notes?: string
  type: 'reminder' | 'ticket'
}

export interface Message {
  sender: string
  text: string
  timestamp: string
}

export interface Conversation {
  id: string
  messages: Message[]
}

export type VesselMap = Record<string, Vessel>
