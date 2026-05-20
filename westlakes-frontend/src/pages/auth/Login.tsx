import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { LockKeyhole } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/useAuth"

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await api.post("/api/auth/login/", {
        email,
        password,
      })

      const { user, tokens, kyc_status } = response.data
      login(user, tokens.access, tokens.refresh)

      if (user.role === "ADMIN") {
        navigate("/admin", { replace: true })
        return
      }

      // Redirect customers to KYC if not approved
      if (kyc_status && kyc_status !== "APPROVED") {
        navigate("/dashboard/verify", { replace: true })
        return
      }

      navigate("/dashboard", { replace: true })
    } catch {
      setError("Unable to sign in. Please check your email and password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div className="flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#D4AF37]">Secure access</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#0F172A] sm:text-6xl">Login to Westlakes Bank.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Sign in securely to continue to your Westlakes Bank workspace.
          </p>
        </div>

        <div className="flex items-center">
          <form className="w-full rounded-3xl border border-slate-200 bg-[#F8FAFC] p-6 shadow-xl shadow-slate-950/5 sm:p-8" onSubmit={handleSubmit}>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0A3D91] text-white">
              <LockKeyhole className="size-5" />
            </span>
            <div className="mt-7 grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Email address
                <Input
                  className="h-12 rounded-2xl bg-white"
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Password
                <Input
                  className="h-12 rounded-2xl bg-white"
                  placeholder="Enter password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
            </div>
            {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p> : null}
            <div className="mt-5 flex items-center justify-between gap-4">
              <Link to="/forgot-password" className="text-sm font-medium text-[#0A3D91] hover:text-[#1E5EFF]">
                Forgot password?
              </Link>
              <Button type="submit" className="h-11 rounded-full bg-[#0A3D91] px-6 text-white hover:bg-[#1E5EFF]" disabled={loading}>
                {loading ? "Signing in..." : "Login"}
              </Button>
            </div>
            <p className="mt-6 text-sm text-slate-600">
              New to Westlakes?{" "}
              <Link to="/register" className="font-semibold text-[#0A3D91] hover:text-[#1E5EFF]">
                Open an account
              </Link>
            </p>
          </form>
        </div>
      </section>
    </div>
  )
}
