import AppRoutes from "./routes/AppRoutes"
import { AuthProvider } from "@/lib/auth"
import { Toaster } from "sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster position="top-right" richColors closeButton />
        <AppRoutes />
      </TooltipProvider>
    </AuthProvider>
  )
}

export default App
