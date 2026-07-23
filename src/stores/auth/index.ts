import { defineStore } from 'pinia'
import state from './state'
import * as actions from './actions'

export const useAuthStore = defineStore('auth', () => {
  const s = state()

  return Object.assign(s, {
    isAuthenticated: actions.isAuthenticated(s),
    register: (payload: { name: string; email: string; password: string }) =>
      actions.register(s, payload),
    login: (payload: { email: string; password: string }) => actions.login(s, payload),
    fetchMe: () => actions.fetchMe(s),
    initializeAuth: () => actions.initializeAuth(s),
    logout: () => actions.logout(s),
  })
})
