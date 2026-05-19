import { useEffect, useState } from "react"
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart"
import { api } from "@/lib/api"
import { Loader2, Users, TrendingUp, ArrowDownLeft, ArrowUpRight } from "lucide-react"

interface AnalyticsData {
  customers_joined: { month: string; count: number }[]
  deposits: { month: string; total: number }[]
  withdrawals: { month: string; total: number }[]
  transactions: { month: string; count: number; volume: number }[]
}

interface DashboardAnalytics {
  accounts: { total: number; active: number; pending: number }
  transactions: { recent_count: number; recent_volume: number }
  customers: { total: number; verified: number }
}

export default function Reports() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
  const [chartData, setChartData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [analyticsRes, reportsRes] = await Promise.all([
          api.get<DashboardAnalytics>("/api/admin/analytics/"),
          api.get<AnalyticsData>("/api/admin/full-analytics/"),
        ])
        setAnalytics(analyticsRes.data)
        setChartData(reportsRes.data)
      } catch (err: any) {
        const detail = err.response?.data?.detail || err.response?.data?.error || err.message
        setError(`Error fetching analytics data: ${detail}`)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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
        <p className="text-red-500">{error || "Unable to load reports."}</p>
      </div>
    )
  }

  const customersJoinedData = chartData?.customers_joined?.map((item) => ({
    period: new Date(item.month).toLocaleDateString("en-GB", { month: "short" }),
    value: item.count,
  })) || []

  const depositsData = chartData?.deposits?.map((item) => ({
    period: new Date(item.month).toLocaleDateString("en-GB", { month: "short" }),
    value: item.total,
  })) || []

  const withdrawalsData = chartData?.withdrawals?.map((item) => ({
    period: new Date(item.month).toLocaleDateString("en-GB", { month: "short" }),
    value: item.total,
  })) || []

  const transactionsData = chartData?.transactions?.map((item) => ({
    period: new Date(item.month).toLocaleDateString("en-GB", { month: "short" }),
    count: item.count,
    volume: item.volume,
  })) || []

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Reports</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Analytics & Reports</h1>
        <p className="mt-1 text-slate-600">Platform-wide analytics derived from real transaction data</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Customers</p>
              <p className="text-xl font-bold text-slate-900">{analytics.customers.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-50 p-2.5">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Active Accounts</p>
              <p className="text-xl font-bold text-slate-900">{analytics.accounts.active}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2.5">
              <ArrowDownLeft className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">30-Day Deposits</p>
              <p className="text-xl font-bold text-slate-900">
                £{analytics.transactions.recent_volume.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-50 p-2.5">
              <ArrowUpRight className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">30-Day Transactions</p>
              <p className="text-xl font-bold text-slate-900">{analytics.transactions.recent_count}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AnalyticsChart
          title="Customers Joined"
          description="New customer registrations per month"
          data={customersJoinedData}
          accentColor="#1E5EFF"
        />
        <AnalyticsChart
          title="Deposits Per Month"
          description="Total deposit volume per month"
          data={depositsData}
          accentColor="#10B981"
        />
        <AnalyticsChart
          title="Withdrawals Per Month"
          description="Total withdrawal volume per month"
          data={withdrawalsData}
          accentColor="#F59E0B"
        />
        <AnalyticsChart
          title="Transactions Per Month"
          description="Transaction count and volume trends"
          data={transactionsData}
          lines={[
            { name: "Count", dataKey: "count", color: "#6366F1" },
            { name: "Volume", dataKey: "volume", color: "#EC4899" },
          ]}
        />
      </div>
    </div>
  )
}
