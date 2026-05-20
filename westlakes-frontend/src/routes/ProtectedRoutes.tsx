import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/lib/useAuth"

interface ProtectedRoutesProps {
  role: "customer" | "admin"
}

export default function ProtectedRoutes({ role }: ProtectedRoutesProps) {
  const { token, user } = useAuth()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (role === "admin" && user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
