import { reactive } from 'vue'
import type { Customer } from '@/types/mock'

export type CustomersState = {
  customers: Customer[]
}

export default function state(): CustomersState {
  return reactive({
    customers: [],
  })
}
