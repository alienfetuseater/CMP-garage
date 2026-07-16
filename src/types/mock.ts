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
  engineHours: number
}

export interface TodoRelated {
  type: 'customer' | 'vessel' | 'ticket'
  id: string
}

export interface Todo {
  id: string
  title: string
  dueDate: string
  completed: boolean
  relatedTo: TodoRelated
}

export type TicketStatus = 'open' | 'in progress' | 'completed' | 'closed' | 'cancelled' | 'on hold'

export type TicketPriority = 'low' | 'medium' | 'high'

export type ServiceCategory = 'inspection' | 'repair' | 'maintenance' | 'upgrade'

export type DiagnosticLevel = 'good' | 'monitor' | 'action' | 'N/A'
export type TicketDiagnostics = Record<string, DiagnosticLevel>

export interface Ticket {
  id: string
  customerId: string
  vesselId: string
  service_category: ServiceCategory
  service_title: string
  status: TicketStatus
  priority: TicketPriority
  createdAt: string
  scheduledDate: string
  notes: string
  messages?: Message[]
  diagnostics?: TicketDiagnostics
}

export interface TodoDisplayItem {
  id: string
  title: string
  date: string
  completed: boolean
  status: string
  type: 'todo' | 'ticket'
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
