import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setAuthToken, clearAuthToken } from '../services/axios'
import type { GitHubUser } from '../types/github'

interface AuthState {
  token: string | null
  user: GitHubUser | null
  setToken: (token: string) => void
  setUser: (user: GitHubUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => {
        setAuthToken(token)
        set({ token })
      },
      setUser: (user) => set({ user }),
      logout: () => {
        clearAuthToken()
        set({ token: null, user: null })
      },
    }),
    {
      name: 'devpulse-auth',
      onRehydrateStorage: () => (state) => {
        if (state?.token) setAuthToken(state.token)
      },
    }
  )
)
