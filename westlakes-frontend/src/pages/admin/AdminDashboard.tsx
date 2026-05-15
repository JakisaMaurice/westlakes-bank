import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, Users, ShieldCheck, BarChart3 } from "lucide-react"

const stats = [
  { label: "Pending approvals", value: "18", icon: ShieldCheck },
  { label: "Active customers", value: "5,420", icon: Users },
  { label: "Transactions today", value: "2,180", icon: Activity },
  { label: "Reports due", value: "4", icon: BarChart3 },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-10">
      <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-950/20">
        <p className="text-sm uppercase tracking-[0.28em] text-amber-300">Admin overview</p>
        <h1 className="mt-4 text-3xl font-semibold">Operational insights at a glance</h1>
        <p className="mt-4 max-w-2xl leading-7 text-slate-300">
          Monitor approvals, customer activity, transactions, and reports with secure admin tools.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button className="rounded-full bg-amber-400 px-6 py-3 text-slate-950 hover:bg-amber-300">Review approvals</Button>
          <Button variant="outline" className="rounded-full px-6 py-3 text-white border-white/20 hover:border-amber-300/70">View reports</Button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.label} className="rounded-[1.75rem] border-slate-200">
              <CardContent className="space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-slate-900">
                  <Icon className="size-5" />
                </div>
                <CardTitle>{item.value}</CardTitle>
                <CardDescription>{item.label}</CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Recent activity</p>
          <ul className="mt-6 space-y-4">
            {[
              "New customer approval submitted",
              "Large transfer flagged for review",
              "Weekly compliance summary ready",
            ].map((item) => (
              <li key={item} className="rounded-3xl bg-slate-50 p-5 text-slate-700">{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Quick actions</p>
          <div className="mt-6 space-y-4">
            {[
              "Approve pending accounts",
              "Review flagged transactions",
              "Send customer alerts",
            ].map((item) => (
              <div key={item} className="rounded-3xl bg-white p-5 text-slate-700 shadow-sm">{item}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
