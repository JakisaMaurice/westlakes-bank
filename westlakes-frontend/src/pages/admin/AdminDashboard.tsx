import { useEffect, useState } from "react"
import { BalanceSummary } from "@/components/dashboard/BalanceSummary"
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart"
import { TicketPanel } from "@/components/dashboard/TicketPanel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import { Activity, Users, ShieldCheck, BarChart3, ClipboardList, TrendingUp, Loader2 } from "lucide-react"

interface DashboardAnalytics {
  accounts: { total: number; active: number; pending: number }
  transactions: { recent_count: number; recent_volume: number }
  customers: { total: number; verified: number }
  monthly_trend: { month: string; count: number; volume: number }[]
}

interface TicketItem {
  id: number
  subject: string
  status: string
  created_at: string
  admin_response: string
}

interface Account {
  id: number
  user_name: string
  account_type: string
  status: string
  account_number: string
}

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      PENDING_VERIFICATION: "Awaiting review",
      APPROVED: "Approved",
      REJECTED: "Rejected",
      ACTIVE: "Active",
    }
    return map[status] || status
  }

const formatCompact = (value: number) => {
  if (value >= 1_000_000) return `£${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `£${(value / 1_000).toFixed(0)}K`
  return `£${value}`
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
  const [tickets, setTickets] = useState<TicketItem[]>([])
  const [pendingAccounts, setPendingAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Deposit form state
  const [depositAccountNumber, setDepositAccountNumber] = useState("")
  const [depositAmount, setDepositAmount] = useState("")
  const [depositDescription, setDepositDescription] = useState("")
  const [depositLoading, setDepositLoading] = useState(false)
  const [depositError, setDepositError] = useState<string | null>(null)
  const [depositSuccess, setDepositSuccess] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [analyticsRes, ticketsRes, accountsRes] = await Promise.all([
          api.get<DashboardAnalytics>("/api/admin/analytics/"),
          api.get<TicketItem[]>("/api/tickets/"),
          api.get<Account[]>("/api/accounts/"),
        ])
        setAnalytics(analyticsRes.data)
        setTickets(ticketsRes.data.slice(0, 5))
        setPendingAccounts(accountsRes.data.filter((a) => a.status === "PENDING_VERIFICATION").slice(0, 3))
      } catch {
        setError("Failed to load dashboard data.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!depositAccountNumber || !depositAmount || parseFloat(depositAmount) <= 0) {
      setDepositError("Please enter a valid account number and amount")
      return
    }

    setDepositLoading(true)
    setDepositError(null)
    setDepositSuccess(false)

    try {
      await api.post("/api/transactions/admin-deposit/", {
        receiver_account_number: depositAccountNumber,
        amount: parseFloat(depositAmount),
        description: depositDescription,
      })
      setDepositSuccess(true)
      // Reset form
      setDepositAccountNumber("")
      setDepositAmount("")
      setDepositDescription("")
      // Optionally, we could refetch accounts to update balances, but for now we'll just show success
    } catch (err: any) {
      setDepositError(err.response?.data?.error || "Failed to process deposit")
    } finally {
      setDepositLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#1E5EFF]" />
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-red-500">{error || "Unable to load dashboard."}</p>
      </div>
    )
  }

  const summaryMetrics = [
    { label: "Total customers", value: analytics.customers.total.toLocaleString(), change: `${analytics.customers.verified} verified`, icon: Users, accentHex: "#66A6FF" },
    { label: "Pending approvals", value: analytics.accounts.pending.toString(), change: `${analytics.accounts.total} total accounts`, icon: ShieldCheck, accentHex: "#7C93FF" },
    { label: "Active accounts", value: analytics.accounts.active.toLocaleString(), change: `${analytics.accounts.total} total`, icon: BarChart3, accentHex: "#8AD5C1" },
    { label: "30-day volume", value: formatCompact(analytics.transactions.recent_volume), change: `${analytics.transactions.recent_count} transactions`, icon: Activity, accentHex: "#FF8A7B" },
  ]

  const performanceData = analytics.monthly_trend.map((item) => ({
    period: new Date(item.month).toLocaleDateString("en-GB", { month: "short" }),
    revenue: item.volume,
    expenses: Math.round(item.volume * 0.65),
  }))

  const openTickets = tickets.filter((t) => t.status === "OPEN" || t.status === "PENDING")
  const resolvedTickets = tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED")

  const ticketRows = tickets.map((t) => ({
    id: String(t.id),
    customer: t.admin_response || "Customer",
    subject: t.subject,
    queue: "Support",
    status: (t.status === "OPEN" ? "Open" : t.status === "PENDING" ? "Pending" : "Resolved") as "Open" | "Pending" | "Resolved",
  }))

  return (
    <div className="space-y-4">
      <BalanceSummary metrics={summaryMetrics} />

      <div className="grid gap-3 lg:grid-cols-[1.4fr_0.95fr]">
        <Card className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm shadow-slate-950/5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-[0.32em] text-slate-400">Performance</p>
              <h2 className="mt-1 text-sm font-semibold text-[#0F172A]">Revenue and cost trends</h2>
              <p className="mt-1 text-xs text-slate-500">Track approvals, payouts, and operational flow within the banking network.</p>
            </div>
            {/* <div className="rounded-full bg-[#EAF2FF] px-2.5 py-1 text-xs font-semibold text-[#1E5EFF]">Updated 30 min ago</div> */}
          </div>

          <div className="mt-4">
            <AnalyticsChart
              title="Monthly performance"
              description="Revenue and expense tracking across key business cycles."
              data={performanceData}
              lines={[
                { name: "Revenue", dataKey: "revenue", color: "#66A6FF" },
                { name: "Expenses", dataKey: "expenses", color: "#FF8A7B" },
              ]}
            />
          </div>
        </Card>

        <div className="space-y-3">
          <Card className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm shadow-slate-950/5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] uppercase tracking-[0.32em] text-slate-400">Customer approvals</p>
                <h3 className="mt-1 text-sm font-semibold text-[#0F172A]">Review queue</h3>
              </div>
              <ClipboardList className="size-3.5 text-[#66A6FF]" />
            </div>
            <div className="mt-3 space-y-2">
              {pendingAccounts.length === 0 ? (
                <p className="text-xs text-slate-500">No pending approvals.</p>
              ) : (
                pendingAccounts.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-[#0F172A]">{item.user_name}</p>
                        <p className="text-[11px] text-slate-500">{item.account_type} account</p>
                      </div>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[#0F172A] shadow-sm">{statusLabel(item.status)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm shadow-slate-950/5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] uppercase tracking-[0.32em] text-slate-400">Transaction health</p>
                <h3 className="mt-1 text-sm font-semibold text-[#0F172A]">Real-time analytics</h3>
              </div>
              <TrendingUp className="size-3.5 text-[#8AD5C1]" />
            </div>
            <div className="mt-3 grid gap-2">
              {[
                { label: "Recent transactions", value: analytics.transactions.recent_count.toString() },
                { label: "Open tickets", value: String(openTickets.length) },
                { label: "Resolved tickets", value: String(resolvedTickets.length) },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-[#F8FAFC] px-3 py-2">
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="mt-1 text-base font-semibold text-[#0F172A]">{item.value}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.25fr_0.75fr]">
        <TicketPanel tickets={ticketRows} />
        <Card className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm shadow-slate-950/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Deposit Funds</CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Deposit money to a customer account. Customer will receive notification and email confirmation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {depositSuccess && (
              <div className="bg-green-50 text-green-800 px-4 py-3 rounded-lg">
                Deposit successful! Customer has been notified.
              </div>
            )}
            {depositError && (
              <div className="bg-red-50 text-red-800 px-4 py-3 rounded-lg">
                {depositError}
              </div>
            )}
            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Account Number
                </label>
                <Input
                  type="text"
                  value={depositAccountNumber}
                  onChange={(e) => setDepositAccountNumber(e.target.value)}
                  placeholder="Enter account number"
                  disabled={depositLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Amount (£)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Enter amount"
                  disabled={depositLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description (optional)
                </label>
                <Textarea
                  value={depositDescription}
                  onChange={(e) => setDepositDescription(e.target.value)}
                  placeholder="Add a description for the deposit"
                  disabled={depositLoading}
                  className="min-h-[80px]"
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-lg px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={depositLoading}
              >
                {depositLoading ? "Processing..." : "Deposit Funds"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
