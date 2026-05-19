import { useEffect, useState, useMemo } from "react"
import { BalanceSummary } from "@/components/dashboard/BalanceSummary"
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart"
import { TransactionsTable } from "@/components/dashboard/TransactionsTable"
import { Card } from "@/components/ui/card"
import { Sparkles, ShieldCheck, Globe, CreditCard, ArrowRight, UserCircle2, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

const financeData = [ { period: "Jul", income: 4700, expenses: 3300 } ]
const recentContacts = [ { name: "Aaron Evans", initials: "AE" }, { name: "Clement Stewart", initials: "CS" }, { name: "Jessica Johanne", initials: "JJ" }, { name: "Mia Chen", initials: "MC" } ]
const goals = [ { title: "New iMac", progress: 54 }, { title: "Vacation fund", progress: 72 }, { title: "Emergency savings", progress: 38 } ]

export default function CustomerDashboard() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [accRes, transRes] = await Promise.all([
          api.get("/api/accounts/"),
          api.get("/api/transactions/"),
        ])
        setAccounts(accRes.data)
        setTransactions(transRes.data.slice(0, 4).map((t: any) => ({
          id: String(t.id),
          date: new Date(t.timestamp).toLocaleDateString("en-GB", { month: "short", day: "numeric" }),
          description: t.description || t.transaction_type,
          category: "General",
          amount: (t.amount > 0 ? "+" : "") + Number(t.amount).toLocaleString("en-GB", { style: "currency", currency: "GBP" }),
          status: t.status === "COMPLETED" ? "Completed" : "Pending"
        })))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    void loadData()
  }, [])

  const metrics = useMemo(() => {
    const total = accounts.reduce((sum, a) => sum + Number(a.balance), 0)
    const savings = accounts.filter(a => a.account_type.includes("Savings")).reduce((sum, a) => sum + Number(a.balance), 0)
    
    return [
      { label: "Balance", value: total.toLocaleString("en-GB", { style: "currency", currency: "GBP" }), change: "Total balance", icon: Sparkles, accentHex: "#66A6FF" },
      { label: "Income", value: "£0.00", change: "Current month", icon: ShieldCheck, accentHex: "#7C93FF" },
      { label: "Expenses", value: "£0.00", change: "Current month", icon: Globe, accentHex: "#FF8A7B" },
      { label: "Savings", value: savings.toLocaleString("en-GB", { style: "currency", currency: "GBP" }), change: "Across savings", icon: CreditCard, accentHex: "#8AD5C1" },
    ]
  }, [accounts])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#0A3D91]" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <BalanceSummary metrics={metrics} />

      <div className="grid gap-3 xl:grid-cols-[1.7fr_0.95fr]">
        <Card className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm shadow-slate-950/5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-[0.32em] text-slate-400">Finances</p>
              <h2 className="mt-1 text-sm font-semibold text-[#0F172A]">Income and expenses</h2>
              <p className="mt-1 text-xs text-slate-500">Monitor your cashflow with clear monthly trends.</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-[#EAF2FF] px-2.5 py-1 text-xs font-semibold text-[#1E5EFF]">Income</span>
              <span className="rounded-full bg-[#FFE8E4] px-2.5 py-1 text-xs font-semibold text-[#D34E3F]">Expenses</span>
            </div>
          </div>

          <div className="mt-4">
            <AnalyticsChart
              title="Monthly cashflow"
              description="Income and expenses for the last 7 months."
              data={financeData}
              lines={[
                { name: "Income", dataKey: "income", color: "#66A6FF" },
                { name: "Expenses", dataKey: "expenses", color: "#FF8A7B" },
              ]}
            />
          </div>
        </Card>

        <div className="space-y-3">
          <Card className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm shadow-slate-950/5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] uppercase tracking-[0.32em] text-slate-400">My card</p>
                <h3 className="mt-1 text-sm font-semibold text-[#0F172A]">Visa Classic</h3>
              </div>
              <span className="rounded-full bg-[#EAF2FF] px-2.5 py-1 text-xs font-semibold text-[#1E5EFF]">Active</span>
            </div>
            <div className="mt-3 rounded-xl bg-gradient-to-r from-[#0A3D91] via-[#1E5EFF] to-[#7B9DFF] p-3.5 text-white shadow-lg shadow-slate-950/10">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.35em] text-slate-200/85">Visa</span>
                <span className="text-[10px] uppercase tracking-[0.35em] text-slate-200/75">Good thru 11/24</span>
              </div>
              <p className="mt-4 text-sm font-semibold tracking-[0.2em]">5995 7474 1103 7513</p>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-200/90">
                <div>
                  <p className="text-slate-200/70">Card holder</p>
                  <p className="mt-0.5 font-semibold">Samantha Gray</p>
                </div>
                <div>
                  <p className="text-slate-200/70">Balance</p>
                  <p className="mt-0.5 text-sm font-semibold">£14,260</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm shadow-slate-950/5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] uppercase tracking-[0.32em] text-slate-400">Quick transaction</p>
                <h3 className="mt-1 text-sm font-semibold text-[#0F172A]">Send money fast</h3>
              </div>
              <ArrowRight className="size-3.5 text-[#0A3D91]" />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {recentContacts.map((contact) => (
                <div key={contact.name} className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-[#F8FAFC] px-2.5 py-1.5">
                  <div className="grid h-7 w-7 place-items-center rounded-xl bg-[#E6EEFF] text-[10px] font-semibold text-[#0A3D91]">{contact.initials}</div>
                  <div>
                    <p className="text-xs font-semibold text-[#0F172A]">{contact.name}</p>
                    <p className="text-[10px] text-slate-500">Preferred</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-3 inline-flex items-center justify-center rounded-full bg-[#0A3D91] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1E5EFF]">
              Send money
            </button>
          </Card>

          <Card className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm shadow-slate-950/5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] uppercase tracking-[0.32em] text-slate-400">My goals</p>
                <h3 className="mt-1 text-sm font-semibold text-[#0F172A]">Savings progress</h3>
              </div>
              <Sparkles className="size-3.5 text-[#66A6FF]" />
            </div>
            <div className="mt-3 space-y-2.5">
              {goals.map((goal) => (
                <div key={goal.title}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-[#0F172A]">{goal.title}</p>
                    <p className="text-xs text-slate-500">{goal.progress}%</p>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-slate-200">
                    <div className="h-1.5 rounded-full bg-[#0A3D91]" style={{ width: `${goal.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-950/5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.35em] text-slate-400">Transaction history</p>
            <h3 className="mt-1 text-sm font-semibold text-[#0F172A]">Recent activity</h3>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF2FF] px-3 py-1.5 text-xs font-semibold text-[#1E5EFF]">
            <UserCircle2 className="size-3.5" /> Trusted network
          </div>
        </div>
        <div className="mt-3">
          <TransactionsTable rows={transactions} />
        </div>
      </Card>
    </div>
  )
}
