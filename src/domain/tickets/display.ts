import type { Customer, Ticket, Vessel } from '@/types/mock'

const normalize = (value: unknown) => String(value ?? '').trim()

export function resolveTicketCustomerName(ticket: Ticket, customers: Customer[]): string {
  const direct = normalize(ticket.customerName)
  if (direct) return direct

  const customerId = normalize(ticket.customerId)
  if (!customerId) return ''

  const matched = customers.find((customer) => normalize(customer.id) === customerId)
  return matched?.name ?? customerId
}

export function resolveTicketVesselName(ticket: Ticket, vessels: Vessel[]): string {
  const direct = normalize(ticket.vesselName)
  if (direct) return direct

  const vesselId = normalize(ticket.vesselId)
  if (!vesselId) return ''

  const matched = vessels.find((vessel) => normalize(vessel.id) === vesselId)
  return matched?.vesselName ?? vesselId
}
