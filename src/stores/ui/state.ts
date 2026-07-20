import { reactive } from 'vue'

export type UiState = {
  loading: boolean
  loaded: boolean
  error: string | null
}

export default function state(): UiState {
  return reactive({
    loading: false,
    loaded: false,
    error: null,
  })
}
