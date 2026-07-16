import { apiFetch } from '@/api'
import type { Vessel } from '@/types/mock'
import type { VesselsState } from './state'

export const fetchVessels = async (state: VesselsState, force = false) => {
  if (!force && state.vessels.length > 0) return state.vessels
  state.vessels = await apiFetch<Vessel[]>('/getAllBoats')
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
