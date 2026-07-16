import { apiFetch } from '@/api'
import type { Customer } from '@/types/mock'
import type { CustomersState } from './state'
import { useUiStore } from '@/stores/ui'

export const fetchCustomers = async (state: CustomersState, force = false) => {
  if (!force && state.customers.length > 0) return state.customers
  const data = await apiFetch<Customer[]>('/getAllCustomers')
  state.customers.splice(0, state.customers.length, ...data)
  return state.customers
}

export const addCustomer = (state: CustomersState, customer: Customer) => {
  state.customers.push(customer)
}

export const customerById = (state: CustomersState, id: string) => {
  return state.customers.find((c) => c.id === id) ?? null
}

/**
 * Matches original data.ts behavior:
 * - Ensures all data is loaded before returning a customer
 */
export const getCustomer = async (state: CustomersState, id: string) => {
  const ui = useUiStore()
  await ui.ensureAllData()
  return customerById(state, id)
}
