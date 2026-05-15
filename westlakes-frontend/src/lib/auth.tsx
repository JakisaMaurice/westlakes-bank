import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

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

interface AuthContextValue {
  user: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  login: (user: UserProfile, accessToken: string, refreshToken: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function getStoredUser(): UserProfile | null {
  if (typeof window === "undefined") {
    return null
  }

  const raw = localStorage.getItem("user")
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null
  }

  return localStorage.getItem("accessToken")
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(getStoredUser)
  const [token, setToken] = useState<string | null>(getStoredToken)

  const login = (user: UserProfile, accessToken: string, refreshToken: string) => {
    localStorage.setItem("accessToken", accessToken)
    localStorage.setItem("refreshToken", refreshToken)
    localStorage.setItem("user", JSON.stringify(user))
    setUser(user)
    setToken(accessToken)
  }

  const logout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    setUser(null)
    setToken(null)
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
