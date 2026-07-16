import type { Vessel } from '@/types/mock'

export type VesselsState = {
  vessels: Vessel[]
}

export default function state(): VesselsState {
  return {
    vessels: [],
  }
}
