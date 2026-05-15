import { Link } from "react-router-dom"
import { ArrowRight, Bell, Fingerprint, Wifi } from "lucide-react"

import { digitalFeatures } from "@/components/shared/siteData"
import { Button } from "@/components/ui/button"

export default function MobileBankingSection() {
  return (
    <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
      <div className="relative mx-auto w-full max-w-sm">
        <div className="rounded-[2.25rem] bg-[#061B3A] p-3 shadow-2xl shadow-[#061B3A]/30">
          <div className="rounded-[1.75rem] bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Mobile wallet</p>
                <p className="mt-2 text-2xl font-semibold text-[#0F172A]">$18,240</p>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#0A3D91] text-white">
                <Fingerprint className="size-5" />
              </span>
            </div>
            <div className="mt-6 rounded-2xl bg-[#0A3D91] p-5 text-white">
              <p className="text-xs uppercase tracking-[0.24em] text-blue-100">Westlakes card</p>
              <p className="mt-8 text-lg font-semibold">•••• 4821</p>
              <div className="mt-6 flex items-center justify-between text-sm text-blue-100">
                <span>Premium debit</span>
                <Wifi className="size-5" />
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {["Transfer completed", "Savings goal updated", "Statement ready"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-[#F8FAFC] p-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[#D4AF37] shadow-sm">
                    <Bell className="size-4" />
                  </span>
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#D4AF37]">Mobile banking</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#0F172A] sm:text-5xl">
          Control your money without slowing down your day.
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          Westlakes mobile banking gives customers a polished, secure way to monitor accounts, manage cards, move money, and keep savings goals visible.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {digitalFeatures.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <Icon className="size-5 text-[#0A3D91]" />
                <h3 className="mt-4 font-semibold text-[#0F172A]">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
              </div>
            )
          })}
        </div>
        <Button asChild className="mt-8 h-12 w-fit rounded-full bg-[#0A3D91] px-6 text-white hover:bg-[#1E5EFF]">
          <Link to="/register">
            Open Account
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
