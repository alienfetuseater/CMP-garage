import { defineStore } from 'pinia'
import state from './state'
import * as actions from './actions'
import type { Vessel } from '@/types/mock'

export const useVesselStore = defineStore('vessels', () => {
  const s = state()

  return {
    ...s,
    fetchVessels: (force?: boolean) => actions.fetchVessels(s, force),
    addVessel: (vessel: Vessel) => actions.addVessel(s, vessel),
    vesselById: (id: string) => actions.vesselById(s, id),
  }
})
