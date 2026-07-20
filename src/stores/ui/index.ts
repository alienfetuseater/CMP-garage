import { defineStore } from 'pinia'
import state from './state'
import * as actions from './actions'

export const useUiStore = defineStore('ui', () => {
  const s = state()

  return Object.assign(s, {
    fetchAllData: (force?: boolean) => actions.fetchAllData(s, force),
    ensureAllData: () => actions.ensureAllData(s),
  })
})
