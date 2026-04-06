// Authentication Store using Zustand
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, LoginCredentials } from '@/lib/types'
import { authApi } from '@/lib/api/api-client'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isHydrated: boolean
  error: string | null
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  clearError: () => void
  setLoading: (loading: boolean) => void
  setHydrated: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,
      error: null,
      
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authApi.login(credentials)
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (err) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: err instanceof Error ? err.message : 'خطا در ورود به سیستم',
          })
          throw err
        }
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        })
      },
      
      clearError: () => {
        set({ error: null })
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
      
      setHydrated: () => {
        set({ isHydrated: true })
      },
    }),
    {
      name: 'voiceiran-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      },
    }
  )
)
