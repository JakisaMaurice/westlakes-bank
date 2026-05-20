import { useEffect, useMemo, useState, useCallback } from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { Plus, Loader2, Clock, CheckCircle, XCircle, AlertTriangle, Snowflake, CreditCard, Lock } from "lucide-react"
import OpenAccountModal from "@/components/customer/OpenAccountModal"

interface Account {
  id: number
  account_number: string
  account_type: string
  account_type_display: string
  currency: string
  currency_display: string
  nickname: string
  balance: number
  status: string
  status_display: string
  created_at: string
  card_number: string | null
  card_status: string
  card_status_label: string
  card_last_four_digits: string | null
  card_expiry: string | null
  card_daily_limit: number
}

const statusConfig: Record<string, { color: string; bgColor: string; icon: typeof Clock; label: string }> = {
  PENDING_VERIFICATION: { color: "text-amber-700", bgColor: "bg-amber-50 border-amber-200", icon: Clock, label: "Pending Approval" },
  ACTIVE: { color: "text-green-700", bgColor: "bg-green-50 border-green-200", icon: CheckCircle, label: "Active" },
  SUSPENDED: { color: "text-orange-700", bgColor: "bg-orange-50 border-orange-200", icon: AlertTriangle, label: "Suspended" },
  FROZEN: { color: "text-blue-700", bgColor: "bg-blue-50 border-blue-200", icon: Snowflake, label: "Frozen" },
  LOCKED: { color: "text-slate-700", bgColor: "bg-slate-50 border-slate-200", icon: AlertTriangle, label: "Locked" },
  REJECTED: { color: "text-red-700", bgColor: "bg-red-50 border-red-200", icon: XCircle, label: "Rejected" },
}

const currencySymbols: Record<string, string> = { GBP: "£", USD: "$", EUR: "€" }

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showOpenModal, setShowOpenModal] = useState(false)

  const fetchAccounts = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get<Account[]>("/api/accounts/")
      setAccounts(response.data)
    } catch {
      setError("Unable to load accounts.")
    } finally {
      setLoading(false)
    }
  }, [])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])
  /* eslint-enable react-hooks/set-state-in-effect */

  const activeAccounts = useMemo(() => accounts.filter((a) => a.status === "ACTIVE"), [accounts])
  const pendingAccounts = useMemo(() => accounts.filter((a) => a.status === "PENDING_VERIFICATION"), [accounts])
  const otherAccounts = useMemo(() => accounts.filter((a) => a.status !== "ACTIVE" && a.status !== "PENDING_VERIFICATION"), [accounts])

  const totals = useMemo(() => {
    const total = activeAccounts.reduce((sum, account) => sum + Number(account.balance), 0)
    return {
      total,
      formatted: total.toLocaleString("en-GB", { style: "currency", currency: "GBP" }),
      count: activeAccounts.length,
    }
  }, [activeAccounts])

  const formatBalance = (account: Account) => {
    const symbol = currencySymbols[account.currency] || account.currency
    return `${symbol}${Number(account.balance).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] uppercase tracking-[0.28em] text-amber-500">Accounts</p>
          <h1 className="mt-1.5 text-xl font-semibold text-slate-950">Your accounts</h1>
          <p className="mt-1 text-sm text-slate-500">Manage all your bank accounts</p>
        </div>
        <Button
          size="sm"
          className="rounded-full bg-slate-950 px-5 text-white hover:bg-slate-800"
          onClick={() => setShowOpenModal(true)}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Open new account
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[9px] uppercase tracking-[0.28em] text-amber-500">Account summary</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Total balance (active)</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{totals.formatted}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Active accounts</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{totals.count}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Pending approval</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{pendingAccounts.length}</p>
              </div>
            </div>
          </div>

          {/* Active Accounts */}
          {activeAccounts.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-slate-700">Active Accounts</h2>
              <div className="grid gap-4 lg:grid-cols-3">
                {activeAccounts.map((account) => (
                  <Card key={account.id} className="rounded-2xl border-green-200 bg-green-50/30">
                    <CardContent className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.24em] text-slate-500">{account.account_type_display}</p>
                          <CardTitle className="text-sm">{account.nickname || account.account_number}</CardTitle>
                          {account.nickname && <p className="font-mono text-xs text-slate-500">{account.account_number}</p>}
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                          <CheckCircle className="h-3 w-3" /> Active
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-slate-950">
                        {formatBalance(account)}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-slate-400">{account.currency_display}</p>
                        {account.card_status === "ACTIVE" && account.card_last_four_digits ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                            <CreditCard className="h-3 w-3" />
                            •••• {account.card_last_four_digits}
                          </span>
                        ) : account.card_status === "BLOCKED" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                            <Lock className="h-3 w-3" />
                            Card Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                            <CreditCard className="h-3 w-3" />
                            No Card
                          </span>
                        )}
                      </div>
                      {account.card_status === "ACTIVE" && account.card_expiry && (
                        <p className="text-[10px] text-slate-400">
                          Card expires {new Date(account.card_expiry).toLocaleDateString("en-GB", { month: "short", year: "numeric" })} · Daily limit £{account.card_daily_limit.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Pending Accounts */}
          {pendingAccounts.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-slate-700">Pending Approval</h2>
              <div className="grid gap-4 lg:grid-cols-3">
                {pendingAccounts.map((account) => (
                  <Card key={account.id} className="rounded-2xl border-amber-200 bg-amber-50/30">
                    <CardContent className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.24em] text-slate-500">{account.account_type_display}</p>
                          <CardTitle className="text-sm">{account.nickname || account.account_number}</CardTitle>
                          {account.nickname && <p className="font-mono text-xs text-slate-500">{account.account_number}</p>}
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                          <Clock className="h-3 w-3" /> Pending
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-slate-400">
                        {formatBalance(account)}
                      </div>
                      <p className="text-[10px] text-slate-400">Awaiting admin approval</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Other Status Accounts */}
          {otherAccounts.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-slate-700">Other Accounts</h2>
              <div className="grid gap-4 lg:grid-cols-3">
                {otherAccounts.map((account) => {
                  const config = statusConfig[account.status] || statusConfig.REJECTED
                  const StatusIcon = config.icon
                  return (
                    <Card key={account.id} className={`rounded-2xl ${config.bgColor}`}>
                      <CardContent className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-[9px] uppercase tracking-[0.24em] text-slate-500">{account.account_type_display}</p>
                            <CardTitle className="text-sm">{account.nickname || account.account_number}</CardTitle>
                            {account.nickname && <p className="font-mono text-xs text-slate-500">{account.account_number}</p>}
                          </div>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.color} bg-white/60`}>
                            <StatusIcon className="h-3 w-3" /> {config.label}
                          </span>
                        </div>
                        <div className="text-lg font-semibold text-slate-950">
                          {formatBalance(account)}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {accounts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center">
              <p className="text-slate-500">No accounts found. Open your first account to get started.</p>
              <Button
                className="mt-4 rounded-full bg-slate-950 px-5 text-white hover:bg-slate-800"
                onClick={() => setShowOpenModal(true)}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Open new account
              </Button>
            </div>
          )}
        </>
      )}

      <OpenAccountModal
        open={showOpenModal}
        onOpenChange={setShowOpenModal}
        onSuccess={fetchAccounts}
      />
    </div>
  )
}
