import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface UserProfile {
  id: number
  full_name: string
  email: string
  phone_number: string
  national_id: string
  role: string
  is_verified: boolean
  is_active: boolean
  created_at?: string
}

interface AuthState {
  user: UserProfile | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  sessionExpiry: number | null

  login: (user: UserProfile, accessToken: string, refreshToken: string) => void
  logout: () => void
  setAccessToken: (token: string) => void
  isSessionValid: () => boolean
  clearSession: () => void
}

const SESSION_DURATION_MS = 60 * 60 * 1000

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      sessionExpiry: null,

      login: (user, accessToken, refreshToken) => {
        const expiry = Date.now() + SESSION_DURATION_MS
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          sessionExpiry: expiry,
        })
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          sessionExpiry: null,
        })
      },

      setAccessToken: (token) => {
        set({ accessToken: token })
      },

      isSessionValid: () => {
        const { sessionExpiry, refreshToken } = get()
        if (!refreshToken) return false
        if (!sessionExpiry) return false
        return Date.now() < sessionExpiry
      },

      clearSession: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          sessionExpiry: null,
        })
      },
    }),
    {
      name: "westlakes-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        sessionExpiry: state.sessionExpiry,
      }),
    }
  )
)
