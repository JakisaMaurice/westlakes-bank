import AppRoutes from "./routes/AppRoutes"
import { AuthProvider } from "@/lib/auth"
import { Toaster } from "sonner"

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors closeButton />
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
