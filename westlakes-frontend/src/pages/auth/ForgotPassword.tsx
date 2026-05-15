import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ForgotPassword() {
  return (
    <div className="bg-white">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-4xl content-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-[#F8FAFC] p-6 shadow-xl shadow-slate-950/5 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#D4AF37]">Reset password</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#0F172A]">Recover account access.</h1>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            This public website screen is presentational only and does not send password reset requests.
          </p>
          <form className="mt-8 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Email address
              <Input className="h-12 rounded-2xl bg-white" type="email" placeholder="name@example.com" />
            </label>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">
                Remembered your password?{" "}
                <Link to="/login" className="font-semibold text-[#0A3D91] hover:text-[#1E5EFF]">
                  Login
                </Link>
              </p>
              <Button type="submit" className="h-11 rounded-full bg-[#0A3D91] px-6 text-white hover:bg-[#1E5EFF]">
                Continue
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}
