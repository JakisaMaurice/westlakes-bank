import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { BadgeCheck, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function Register() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [nationalId, setNationalId] = useState("")
  const [accountType, setAccountType] = useState("Personal banking")
  const [message, setMessage] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSuccess("")

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)

    try {
      await api.post("/api/auth/register/", {
        full_name: fullName,
        email,
        phone_number: phoneNumber,
        national_id: nationalId,
        password,
        password_confirm: confirmPassword,
      })

      setSuccess("Account created successfully. Redirecting to login...")
      toast.success("Welcome email sent", { description: "A confirmation has been sent to your email address." })
      window.setTimeout(() => navigate("/login", { replace: true }), 900)
    } catch {
      setError("Unable to create account. Please verify your details and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white">
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-20">
        <div className="flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#D4AF37]">Open account</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#0F172A] sm:text-6xl">Start your Westlakes relationship.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Create your account with secure password setup and guided onboarding.
          </p>
          <div className="mt-8 rounded-3xl bg-[#0A3D91] p-6 text-white">
            <BadgeCheck className="size-7 text-[#D4AF37]" />
            <p className="mt-4 text-xl font-semibold">Premium onboarding starts with clarity.</p>
            <p className="mt-2 leading-7 text-blue-100">Your application is submitted securely for account creation and verification.</p>
          </div>
        </div>

        <form className="rounded-3xl border border-slate-200 bg-[#F8FAFC] p-6 shadow-xl shadow-slate-950/5 sm:p-8" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Full name
              <Input className="h-12 rounded-2xl bg-white" placeholder="Alex Morgan" type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Email address
              <Input className="h-12 rounded-2xl bg-white" placeholder="name@example.com" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Phone number
              <Input className="h-12 rounded-2xl bg-white" placeholder="+1 (555) 000-0000" type="tel" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} required />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              National ID / Passport
              <Input className="h-12 rounded-2xl bg-white" placeholder="ID or passport number" type="text" value={nationalId} onChange={(event) => setNationalId(event.target.value)} required />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Account type
              <select
                className="h-12 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#1E5EFF] focus:ring-3 focus:ring-[#1E5EFF]/20"
                value={accountType}
                onChange={(event) => setAccountType(event.target.value)}
              >
                <option>Personal banking</option>
                <option>Business banking</option>
                <option>Savings</option>
                <option>Investments</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Password
              <span className="relative">
                <Input
                  className="h-12 rounded-2xl bg-white pr-12"
                  placeholder="Create password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-[#0A3D91]"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </span>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Confirm password
              <span className="relative">
                <Input
                  className="h-12 rounded-2xl bg-white pr-12"
                  placeholder="Confirm password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-[#0A3D91]"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </span>
            </label>
          </div>
          <label className="mt-4 grid gap-2 text-sm font-semibold text-slate-700">
            What are you looking for?
            <textarea
              className="min-h-36 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1E5EFF] focus:ring-3 focus:ring-[#1E5EFF]/20"
              placeholder="Tell us about your banking needs"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>
          {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p> : null}
          {success ? <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{success}</p> : null}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-[#0A3D91] hover:text-[#1E5EFF]">
                Login
              </Link>
            </p>
            <Button type="submit" className="h-11 rounded-full bg-[#0A3D91] px-6 text-white hover:bg-[#1E5EFF]" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}
