import { Navigate, Outlet } from "react-router-dom"

interface ProtectedRoutesProps {
  role: "customer" | "admin"
}

export default function ProtectedRoutes({ role }: ProtectedRoutesProps) {
  const isAuthenticated = true
  const currentRole: string = "customer"

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (role === "admin" && currentRole !== "admin") {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
