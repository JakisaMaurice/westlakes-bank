import { Link } from "react-router-dom"
import { ArrowRight, CheckCircle2, CreditCard, ShieldCheck, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"

function DashboardVisual() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute -left-4 top-10 z-20 hidden rounded-2xl border border-white/70 bg-white/95 p-4 shadow-2xl shadow-blue-950/30 sm:-left-10 sm:block">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Monthly growth</p>
        <div className="mt-3 flex items-end gap-2">
          <p className="text-2xl font-semibold text-[#0F172A]">+18.4%</p>
          <TrendingUp className="mb-1 size-5 text-emerald-500" />
        </div>
      </div>

      <div className="absolute -right-2 bottom-12 z-20 hidden rounded-2xl border border-white/70 bg-white/95 p-4 shadow-2xl shadow-blue-950/30 sm:-right-8 sm:block">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#0A3D91] text-white">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-[#0F172A]">Protected</p>
            <p className="text-xs text-slate-500">Secure session</p>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/25 bg-white/15 p-3 shadow-2xl shadow-[#061B3A]/30 backdrop-blur">
        <div className="overflow-hidden rounded-[1.5rem] bg-white">
          <div className="bg-[#061B3A] p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-blue-100">Total balance</p>
                <p className="mt-3 text-4xl font-semibold">$84,920.40</p>
              </div>
              <CreditCard className="size-9 text-[#D4AF37]" />
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {["Save", "Pay", "Invest"].map((item) => (
                <div key={item} className="rounded-2xl bg-white/10 px-3 py-3 text-center text-sm text-blue-50">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-[#0F172A]">Recent activity</p>
              <p className="text-sm text-[#1E5EFF]">View all</p>
            </div>
            <div className="mt-4 space-y-3">
              {[
                ["Business deposit", "+$12,400", "text-emerald-600"],
                ["Savings transfer", "-$2,000", "text-slate-700"],
                ["Card payment", "-$184", "text-slate-700"],
              ].map(([label, amount, color]) => (
                <div key={label} className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[#0A3D91] shadow-sm">
                      <CheckCircle2 className="size-4" />
                    </span>
                    <p className="text-sm font-medium text-slate-700">{label}</p>
                  </div>
                  <p className={`text-sm font-semibold ${color}`}>{amount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#03183F] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(30,94,255,0.36),transparent_42%),radial-gradient(circle_at_10%_15%,rgba(212,175,55,0.18),transparent_26%),radial-gradient(circle_at_78%_8%,rgba(30,94,255,0.28),transparent_30%)]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#061B3A] to-transparent" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-20">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/15 px-4 py-2 text-sm font-semibold text-[#F4D777]">
            <ShieldCheck className="size-4" />
            FDIC-style confidence with premium digital access
          </div>
          <h1 className="mt-7 max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Banking built for the way ambition moves.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-100">
            Westlakes Bank brings secure accounts, fast transfers, thoughtful lending, and wealth tools into one refined public banking experience.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-12 rounded-full bg-[#D4AF37] px-6 text-[#061B3A] shadow-xl shadow-[#D4AF37]/20 hover:bg-[#e6c65a]">
              <Link to="/register">
                Open Account
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-12 rounded-full border-white/25 bg-white/10 px-6 text-white hover:bg-white/15">
              <Link to="/services">Explore Services</Link>
            </Button>
          </div>

          <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              ["4.9/5", "Client rating"],
              ["60 sec", "Typical transfer"],
              ["24/7", "Support access"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/15 bg-white/10 p-4 shadow-lg shadow-blue-950/20 backdrop-blur">
                <p className="text-2xl font-semibold text-white">{value}</p>
                <p className="mt-1 text-sm text-blue-100">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#071F52] p-6 shadow-2xl shadow-black/30 ring-1 ring-white/10 lg:p-10">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(30,94,255,0.48),transparent_46%),radial-gradient(circle_at_80%_10%,rgba(212,175,55,0.32),transparent_28%)]" />
          <div className="relative">
            <DashboardVisual />
          </div>
        </div>
      </div>
    </section>
  )
}
