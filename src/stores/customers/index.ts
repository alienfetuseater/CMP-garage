import { defineStore } from 'pinia'
import { computed } from 'vue'
import state from './state'
import * as actions from './actions'
import type { Customer } from '@/types/mock'

export const useCustomerStore = defineStore('customers', () => {
  const s = state()

  const customerCount = computed(() => s.customers.length)

  return Object.assign(s, {
    customerCount,
    fetchCustomers: (force?: boolean) => actions.fetchCustomers(s, force),
    // Typed arguments
    addCustomer: (customer: Customer) => actions.addCustomer(s, customer),
    customerById: (id: string) => actions.customerById(s, id),
    getCustomer: (id: string) => actions.getCustomer(s, id),
  })
})
