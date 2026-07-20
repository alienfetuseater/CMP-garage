import { apiFetch } from '@/api'
import type { Customer } from '@/types/mock'
import type { CustomersState } from './state'
import { useUiStore } from '@/stores/ui'

type CustomerApiRecord = Customer & {
  _id?: string
}

const normalizeCustomer = (record: CustomerApiRecord): Customer => {
  return {
    ...record,
    id: String(record.id ?? record._id ?? ''),
  }
}

export const fetchCustomers = async (state: CustomersState, force = false) => {
  if (!force && state.customers.length > 0) return state.customers
  const data = await apiFetch<CustomerApiRecord[]>('/getAllCustomers')
  const normalized = data.map(normalizeCustomer)
  state.customers.splice(0, state.customers.length, ...normalized)
  return state.customers
}

export const addCustomer = (state: CustomersState, customer: Customer) => {
  const normalized = normalizeCustomer(customer)
  const index = state.customers.findIndex((c) => c.id === normalized.id)
  if (index >= 0) state.customers[index] = normalized
  else state.customers.push(normalized)
}

export const customerById = (state: CustomersState, id: string) => {
  return state.customers.find((c) => String(c.id) === String(id)) ?? null
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
