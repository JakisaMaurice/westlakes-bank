import AppRoutes from "./routes/AppRoutes"
import { AuthProvider } from "@/lib/auth"

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App;