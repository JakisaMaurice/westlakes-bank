import { useEffect, type ReactNode } from "react"
import { useAuthStore } from "@/stores/authStore"

export function AuthProvider({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isSessionValid = useAuthStore((s) => s.isSessionValid)
  const clearSession = useAuthStore((s) => s.clearSession)

  useEffect(() => {
    if (isAuthenticated && !isSessionValid()) {
      clearSession()
      window.location.href = "/login"
    }
  }, [isAuthenticated, isSessionValid, clearSession])

  return <>{children}</>
}
