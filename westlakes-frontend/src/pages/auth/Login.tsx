import { Link } from "react-router-dom"
import { LockKeyhole } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Login() {
  return (
    <div className="bg-white">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div className="flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#D4AF37]">Secure access</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#0F172A] sm:text-6xl">Login to Westlakes Bank.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            This is a public website login screen only. No authentication request or dashboard routing is implemented here.
          </p>
        </div>

        <div className="flex items-center">
          <form className="w-full rounded-3xl border border-slate-200 bg-[#F8FAFC] p-6 shadow-xl shadow-slate-950/5 sm:p-8">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0A3D91] text-white">
              <LockKeyhole className="size-5" />
            </span>
            <div className="mt-7 grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Email address
                <Input className="h-12 rounded-2xl bg-white" placeholder="name@example.com" type="email" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Password
                <Input className="h-12 rounded-2xl bg-white" placeholder="Enter password" type="password" />
              </label>
            </div>
            <div className="mt-5 flex items-center justify-between gap-4">
              <Link to="/forgot-password" className="text-sm font-medium text-[#0A3D91] hover:text-[#1E5EFF]">
                Forgot password?
              </Link>
              <Button type="submit" className="h-11 rounded-full bg-[#0A3D91] px-6 text-white hover:bg-[#1E5EFF]">
                Login
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
