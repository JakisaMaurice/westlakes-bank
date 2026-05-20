import { useAuthStore, type UserProfile } from "@/stores/authStore"

export interface AuthContextValue {
  user: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  login: (user: UserProfile, accessToken: string, refreshToken: string) => void
  logout: () => void
}

export function useAuth(): AuthContextValue {
  const user = useAuthStore((s) => s.user)
  const accessToken = useAuthStore((s) => s.accessToken)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const login = useAuthStore((s) => s.login)
  const logout = useAuthStore((s) => s.logout)
  return { user, token: accessToken, isAuthenticated, login, logout }
}
