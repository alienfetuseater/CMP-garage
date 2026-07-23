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
  boatPhotoDataUrl?: string
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
  messages?: ConversationMessage[]
  archivedByUserIds?: string[]
  relatedTo: ReminderRelated
}

export type ConversationType = 'ticket' | 'reminder'

export interface ConversationMessage {
  id: string
  senderId: string
  senderName: string
  recipientId: string
  recipientName: string
  text: string
  timestamp: string
  readByUserIds: string[]
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
  messages?: ConversationMessage[]
  archivedByUserIds?: string[]
  diagnostics?: TicketDiagnostics
}

export interface ConversationSummary {
  conversationId: string
  type: ConversationType
  entityId: string
  title: string
  subtitle: string
  sourceRouteName: 'Ticket' | 'Reminder'
  partnerNames: string[]
  lastMessageAt: string
  lastMessagePreview: string
  messageCount: number
  unreadCount: number
  hasUnread: boolean
}

export interface ConversationRecord {
  conversationId: string
  type: ConversationType
  entityId: string
  title: string
  subtitle: string
  sourceRouteName: 'Ticket' | 'Reminder'
  archivedByUserIds: string[]
  messages: ConversationMessage[]
}

export interface UserSummary {
  id: string
  name: string
  email: string
  role: string
  createdAt?: string
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

export interface Conversation {
  id: string
  messages: ConversationMessage[]
}

export type VesselMap = Record<string, Vessel>
