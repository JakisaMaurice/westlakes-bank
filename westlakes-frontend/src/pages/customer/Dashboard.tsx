import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { CreditCard, DollarSign, ShieldCheck, TrendingUp } from "lucide-react"

const stats = [
  { label: "Total balance", value: "£48,260", icon: DollarSign },
  { label: "Monthly spending", value: "£3,820", icon: CreditCard },
  { label: "Savings goal", value: "£12,400", icon: TrendingUp },
  { label: "Security status", value: "Protected", icon: ShieldCheck },
]

const recent = [
  { description: "Salary deposit", amount: "+£4,500", date: "Today" },
  { description: "Utility transfer", amount: "-£220", date: "Yesterday" },
  { description: "Card payment", amount: "-£85", date: "2 days ago" },
]

export default function CustomerDashboard() {
  return (
    <div className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-950/20">
          <p className="text-sm uppercase tracking-[0.28em] text-amber-300">Welcome back</p>
          <h2 className="mt-4 text-3xl font-semibold">Your personal dashboard</h2>
          <p className="mt-4 max-w-xl leading-7 text-slate-300">
            Review account activity, initiate transfers, and stay on top of new notifications in one secure place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button className="rounded-full bg-amber-400 px-6 py-3 text-slate-950 hover:bg-amber-300">Make a transfer</Button>
            <Button variant="outline" className="rounded-full px-6 py-3 text-white border-white/20 hover:border-amber-300/50">View accounts</Button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {stats.map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.label} className="rounded-[1.75rem] border-slate-200">
                <CardContent className="space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-amber-50 text-amber-600">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle>{item.value}</CardTitle>
                  <CardDescription>{item.label}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Recent activity</p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-950">Latest transactions</h3>
            </div>
            <Button variant="outline" className="rounded-full px-4 py-2 text-slate-700 hover:bg-slate-100">
              See all
            </Button>
          </div>
          <div className="mt-8 space-y-4">
            {recent.map((item) => (
              <div key={item.description} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div>
                  <p className="font-semibold text-slate-950">{item.description}</p>
                  <p className="text-sm text-slate-500">{item.date}</p>
                </div>
                <p className={`text-sm font-semibold ${item.amount.startsWith("+") ? "text-emerald-600" : "text-slate-950"}`}>{item.amount}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Action center</p>
          <div className="mt-6 space-y-4">
            {[
              "Review your account summary",
              "Schedule a recurring payment",
              "Update security settings",
            ].map((item) => (
              <div key={item} className="rounded-3xl bg-slate-50 p-5 text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
