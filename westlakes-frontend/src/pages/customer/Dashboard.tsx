import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import { Loader2, AlertCircle, CheckCircle, Clock, ArrowRight, CreditCard, Banknote, PlusCircle, ShieldCheck } from "lucide-react"
import kycService from "@/services/kycService"

interface Account {
  id: number
  account_number: string
  account_type: string
  balance: string
  status: string
  card_status?: string
  card_last_four_digits?: string
}

export default function CustomerDashboard() {
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [kycStatus, setKycStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchData = async () => {
    setLoading(true)
    try {
      const [accountsRes, kycRes] = await Promise.all([
        api.get<Account[]>("/api/accounts/"),
        kycService.getMyKYC(),
      ])
      setAccounts(accountsRes.data)
      setKycStatus(kycRes.data.status)

      if (kycRes.data.status !== "APPROVED") {
        navigate("/dashboard/verify", { replace: true })
        return
      }
    } catch {
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const totalBalance = accounts
    .filter((a) => a.status === "ACTIVE")
    .reduce((sum, acc) => sum + parseFloat(acc.balance), 0)

  const activeAccounts = accounts.filter((a) => a.status === "ACTIVE")
  const pendingAccounts = accounts.filter((a) => a.status === "PENDING_VERIFICATION")
  const restrictedAccounts = accounts.filter(
    (a) => !["ACTIVE", "PENDING_VERIFICATION"].includes(a.status)
  )

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Welcome back</h1>
        <p className="mt-2 text-slate-600">Here's an overview of your account</p>
      </div>

      {pendingAccounts.length > 0 && (
        <Card className="rounded-2xl border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-amber-100 p-3">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">Account Pending Activation</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {pendingAccounts.length} account{pendingAccounts.length > 1 ? "s" : ""} awaiting admin approval.
                  You'll be able to transact once activated.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {restrictedAccounts.length > 0 && (
        <Card className="rounded-2xl border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-red-100 p-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">Account Access Restricted</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {restrictedAccounts.length} account{restrictedAccounts.length > 1 ? "s" : ""} {restrictedAccounts.length > 1 ? "are" : "is"} currently{" "}
                  {restrictedAccounts.map((a) => a.status.replace("_", " ").toLowerCase()).join(", ")}.
                  Please contact support for assistance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              £{totalBalance.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-xs text-slate-400">Across {activeAccounts.length} active account{activeAccounts.length !== 1 ? "s" : ""}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{activeAccounts.length}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-lg font-semibold text-green-600">Verified</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{pendingAccounts.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-slate-200">
          <CardHeader>
            <CardTitle>Your Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <p className="text-slate-500">No accounts found</p>
            ) : (
              <div className="space-y-4">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                  >
                    <div>
                      <p className="font-mono text-sm text-slate-900">{account.account_number}</p>
                      <p className="text-sm text-slate-500">{account.account_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        £{parseFloat(account.balance).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                      </p>
                      <div className="flex items-center gap-2 justify-end mt-1">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            account.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : account.status === "PENDING_VERIFICATION"
                              ? "bg-amber-100 text-amber-700"
                              : account.status === "SUSPENDED"
                              ? "bg-orange-100 text-orange-700"
                              : account.status === "FROZEN"
                              ? "bg-blue-100 text-blue-700"
                              : account.status === "LOCKED"
                              ? "bg-red-100 text-red-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {account.status.replace("_", " ")}
                        </span>
                        {account.card_status === "ACTIVE" && account.card_last_four_digits && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700">
                            <CreditCard className="h-2.5 w-2.5" />
                            ••{account.card_last_four_digits}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => (window.location.href = "/dashboard/deposit")}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Deposit Funds
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => (window.location.href = "/dashboard/transfers")}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Send Money
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => (window.location.href = "/dashboard/withdraw")}
              >
                <Banknote className="mr-2 h-4 w-4" />
                ATM Withdrawal
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => (window.location.href = "/dashboard/transactions")}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                View Transactions
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => (window.location.href = "/dashboard/accounts")}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Manage Accounts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
