import type { Customer, Ticket, Vessel } from '@/types/mock'

export function normalizeSearchText(value: string) {
  return value.trim().toLowerCase()
}

export function filterCustomers(customers: Customer[], query: string, limit = 6) {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return []

  return customers
    .filter((customer) => {
      const name = normalizeSearchText(customer.name || '')
      const phone = normalizeSearchText(customer.phone || '')
      const email = normalizeSearchText(customer.email || '')
      return (
        name.includes(normalizedQuery) ||
        phone.includes(normalizedQuery) ||
        email.includes(normalizedQuery)
      )
    })
    .slice(0, limit)
}

export function filterVessels(vessels: Vessel[], query: string, limit = 6) {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return []

  return vessels
    .filter((vessel) => {
      const vesselName = normalizeSearchText(vessel.vesselName || '')
      const make = normalizeSearchText(vessel.vesselMake || '')
      const owner = normalizeSearchText(vessel.customerName || '')
      const year = String(vessel.vesselYear || '')
      return (
        vesselName.includes(normalizedQuery) ||
        make.includes(normalizedQuery) ||
        owner.includes(normalizedQuery) ||
        year.includes(normalizedQuery)
      )
    })
    .slice(0, limit)
}

export function filterTickets(tickets: Ticket[], query: string, limit = 6) {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return []

  return tickets
    .filter((ticket) => {
      const title = normalizeSearchText(ticket.service_title || '')
      const category = normalizeSearchText(ticket.service_category || '')
      const status = normalizeSearchText(ticket.status || '')
      const priority = normalizeSearchText(ticket.priority || '')
      const customer = normalizeSearchText(ticket.customerName || '')
      const vessel = normalizeSearchText(ticket.vesselName || '')
      const id = normalizeSearchText(ticket.id || '')
      return (
        title.includes(normalizedQuery) ||
        category.includes(normalizedQuery) ||
        status.includes(normalizedQuery) ||
        priority.includes(normalizedQuery) ||
        customer.includes(normalizedQuery) ||
        vessel.includes(normalizedQuery) ||
        id.includes(normalizedQuery)
      )
    })
    .slice(0, limit)
}
