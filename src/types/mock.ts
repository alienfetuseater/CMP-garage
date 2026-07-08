export interface Customer {
  id: string
  name: string
  phone: string
  email: string
  address: string
  createdAt: string
}

export interface Vessel {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  vesselName: string
  vesselMake: string
  vesselYear: number
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

export interface Ticket {
  id: string
  customerId: string
  vesselId: string
  title: string
  status: string
  priority: string
  createdAt: string
  scheduledDate: string
  notes: string
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
