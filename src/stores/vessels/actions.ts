import { apiFetch } from '@/api'
import type { Vessel } from '@/types/mock'
import type { VesselsState } from './state'
import { useUiStore } from '@/stores/ui'

export const fetchVessels = async (state: VesselsState, force = false) => {
  if (!force && state.vessels.length > 0) return state.vessels
  const data = await apiFetch<Vessel[]>('/getAllBoats')
  state.vessels.splice(0, state.vessels.length, ...data)
  return state.vessels
}

export const addVessel = (state: VesselsState, vessel: Vessel) => {
  const index = state.vessels.findIndex((v) => v.id === vessel.id)
  if (index >= 0) state.vessels[index] = vessel
  else state.vessels.push(vessel)
}

export const vesselById = (state: VesselsState, id: string) => {
  return state.vessels.find((v) => v.id === id) ?? null
}

export const getVessel = async (state: VesselsState, id: string) => {
  const ui = useUiStore()
  await ui.ensureAllData()
  return vesselById(state, id)
}
