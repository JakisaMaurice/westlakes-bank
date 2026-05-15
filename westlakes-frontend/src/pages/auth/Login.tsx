import { useState, type FormEvent } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
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

      login(response.data.user, response.data.tokens.access, response.data.tokens.refresh)

      if (response.data.user.role === "ADMIN") {
        navigate("/admin", { replace: true })
      } else {
        navigate("/customer", { replace: true })
      }
    } catch (err) {
      setError("Unable to sign in. Check your email and password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <section className="rounded-[2rem] bg-white p-10 shadow-sm shadow-slate-200/60">
        <p className="text-sm uppercase tracking-[0.32em] text-amber-500">Secure access</p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-950 sm:text-5xl">Login to your Westlakes account.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Access your accounts, view transactions, and manage your banking from a secure dashboard.
        </p>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-slate-50 p-10 shadow-sm">
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">Email address</label>
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">Password</label>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/forgot-password" className="text-sm text-amber-600 hover:text-amber-500">
              Forgot password?
            </Link>
            <Button type="submit" className="rounded-full px-6 py-3 bg-slate-950 text-white hover:bg-slate-800" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}
