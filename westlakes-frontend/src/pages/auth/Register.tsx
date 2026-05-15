import { Link } from "react-router-dom"
import { BadgeCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Register() {
  return (
    <div className="bg-white">
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-20">
        <div className="flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#D4AF37]">Open account</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#0F172A] sm:text-6xl">Start your Westlakes relationship.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Share your interest in a personal or business account. This screen is frontend-only and does not submit to a backend.
          </p>
          <div className="mt-8 rounded-3xl bg-[#0A3D91] p-6 text-white">
            <BadgeCheck className="size-7 text-[#D4AF37]" />
            <p className="mt-4 text-xl font-semibold">Premium onboarding starts with clarity.</p>
            <p className="mt-2 leading-7 text-blue-100">No fake account creation or API calls are included in this public website implementation.</p>
          </div>
        </div>

        <form className="rounded-3xl border border-slate-200 bg-[#F8FAFC] p-6 shadow-xl shadow-slate-950/5 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Full name
              <Input className="h-12 rounded-2xl bg-white" placeholder="Alex Morgan" type="text" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Email address
              <Input className="h-12 rounded-2xl bg-white" placeholder="name@example.com" type="email" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Phone number
              <Input className="h-12 rounded-2xl bg-white" placeholder="+1 (555) 000-0000" type="tel" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Account type
              <select className="h-12 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#1E5EFF] focus:ring-3 focus:ring-[#1E5EFF]/20">
                <option>Personal banking</option>
                <option>Business banking</option>
                <option>Savings</option>
                <option>Investments</option>
              </select>
            </label>
          </div>
          <label className="mt-4 grid gap-2 text-sm font-semibold text-slate-700">
            What are you looking for?
            <textarea
              className="min-h-36 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1E5EFF] focus:ring-3 focus:ring-[#1E5EFF]/20"
              placeholder="Tell us about your banking needs"
            />
          </label>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-[#0A3D91] hover:text-[#1E5EFF]">
                Login
              </Link>
            </p>
            <Button type="submit" className="h-11 rounded-full bg-[#0A3D91] px-6 text-white hover:bg-[#1E5EFF]">
              Submit Interest
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}
