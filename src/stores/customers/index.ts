import { defineStore } from 'pinia'
import state from './state'
import * as actions from './actions'
import type { Customer } from '@/types/mock'

export const useCustomerStore = defineStore('customers', () => {
  const s = state()

  return {
    ...s,

    fetchCustomers: (force?: boolean) => actions.fetchCustomers(s, force),
    addCustomer: (customer: Customer) => actions.addCustomer(s, customer),
    customerById: (id: string) => actions.customerById(s, id),
  }
})
