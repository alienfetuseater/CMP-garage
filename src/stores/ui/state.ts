export type UiState = {
  loading: boolean
  loaded: boolean
  error: string | null
}

export default function state(): UiState {
  return {
    loading: false,
    loaded: false,
    error: null,
  }
}
