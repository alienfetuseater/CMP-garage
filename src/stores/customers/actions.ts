import { apiFetch } from '@/api'
import type { Customer } from '@/types/mock'
import type { CustomersState } from './state'

export const fetchCustomers = async (state: CustomersState, force = false) => {
  if (!force && state.customers.length > 0) return state.customers
  state.customers = await apiFetch<Customer[]>('/getAllCustomers')
  return state.customers
}

export const addCustomer = (state: CustomersState, customer: Customer) => {
  state.customers.push(customer)
}

export const customerById = (state: CustomersState, id: string) => {
  return state.customers.find((c) => c.id === id) ?? null
}
