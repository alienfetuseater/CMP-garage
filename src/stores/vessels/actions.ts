import { apiFetch } from '@/services/http/client'
import type { Vessel } from '@/types/mock'
import type { VesselsState } from './state'
import { useUiStore } from '@/stores/ui'
import { findById, replaceCollection, resolveRecordId, upsertById } from '@/stores/shared/records'

type VesselApiRecord = Vessel & {
  _id?: string
}

const normalizeVessel = (record: VesselApiRecord): Vessel => {
  return {
    ...record,
    id: resolveRecordId(record),
  }
}

export const fetchVessels = async (state: VesselsState, force = false) => {
  if (!force && state.vessels.length > 0) return state.vessels
  const data = await apiFetch<VesselApiRecord[]>('/getAllBoats')
  const normalized = data.map(normalizeVessel)
  replaceCollection(state.vessels, normalized)
  return state.vessels
}

export const addVessel = (state: VesselsState, vessel: Vessel) => {
  const normalized = normalizeVessel(vessel)
  upsertById(state.vessels, normalized)
}

export const vesselById = (state: VesselsState, id: string) => {
  return findById(state.vessels, id)
}

export const getVessel = async (state: VesselsState, id: string) => {
  const ui = useUiStore()
  await ui.ensureAllData()
  return vesselById(state, id)
}
