import { apiFetch } from '@/api'
import type { Vessel } from '@/types/mock'
import type { VesselsState } from './state'
import { useUiStore } from '@/stores/ui'

type VesselApiRecord = Vessel & {
  _id?: string
}

const normalizeVessel = (record: VesselApiRecord): Vessel => {
  return {
    ...record,
    id: String(record.id ?? record._id ?? ''),
  }
}

export const fetchVessels = async (state: VesselsState, force = false) => {
  if (!force && state.vessels.length > 0) return state.vessels
  const data = await apiFetch<VesselApiRecord[]>('/getAllBoats')
  const normalized = data.map(normalizeVessel)
  state.vessels.splice(0, state.vessels.length, ...normalized)
  return state.vessels
}

export const addVessel = (state: VesselsState, vessel: Vessel) => {
  const normalized = normalizeVessel(vessel)
  const index = state.vessels.findIndex((v) => v.id === normalized.id)
  if (index >= 0) state.vessels[index] = normalized
  else state.vessels.push(normalized)
}

export const vesselById = (state: VesselsState, id: string) => {
  return state.vessels.find((v) => String(v.id) === String(id)) ?? null
}

export const getVessel = async (state: VesselsState, id: string) => {
  const ui = useUiStore()
  await ui.ensureAllData()
  return vesselById(state, id)
}
