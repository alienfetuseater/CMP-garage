import { apiFetch } from '@/services/http/client'
import type { Customer } from '@/types/mock'
import type { CustomersState } from './state'
import { useUiStore } from '@/stores/ui'
import { findById, replaceCollection, resolveRecordId, upsertById } from '@/stores/shared/records'

type CustomerApiRecord = Customer & {
  _id?: string
}

const normalizeCustomer = (record: CustomerApiRecord): Customer => {
  return {
    ...record,
    id: resolveRecordId(record),
  }
}

export const fetchCustomers = async (state: CustomersState, force = false) => {
  if (!force && state.customers.length > 0) return state.customers
  const data = await apiFetch<CustomerApiRecord[]>('/getAllCustomers')
  const normalized = data.map(normalizeCustomer)
  replaceCollection(state.customers, normalized)
  return state.customers
}

export const addCustomer = (state: CustomersState, customer: Customer) => {
  const normalized = normalizeCustomer(customer)
  upsertById(state.customers, normalized)
}

export const customerById = (state: CustomersState, id: string) => {
  return findById(state.customers, id)
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
