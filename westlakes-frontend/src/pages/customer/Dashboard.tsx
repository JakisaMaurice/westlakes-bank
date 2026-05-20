import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import { Loader2, AlertCircle, CheckCircle, Clock, FileText, ArrowRight, CreditCard, Banknote } from "lucide-react"
import KYCUpload from "@/components/dashboard/KYCUpload"
import kycService, { type KYCVerification } from "@/services/kycService"

interface Account {
  id: number
  account_number: string
  account_type: string
  balance: string
  status: string
}

export default function CustomerDashboard() {
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [kyc, setKyc] = useState<KYCVerification | null>(null)
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
      setKyc(kycRes.data)
    } catch {
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchData()
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Redirect to KYC if not approved
  useEffect(() => {
    if (!loading && kyc && kyc.status !== "APPROVED") {
      navigate("/dashboard/verify", { replace: true })
    }
  }, [loading, kyc, navigate])

  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0)

  const getKYCStatusConfig = () => {
    if (!kyc) {
      return {
        icon: Clock,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        title: "Complete Your Verification",
        message: "Upload your KYC documents to activate your account",
        action: "Start Verification",
      }
    }

    switch (kyc.status) {
      case "APPROVED":
        return {
          icon: CheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          title: "Verification Approved",
          message: "Your account is fully verified and active",
          action: null,
        }
      case "REJECTED":
        return {
          icon: AlertCircle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          title: "Verification Rejected",
          message: kyc.rejection_reason || "Please resubmit your documents",
          action: "Resubmit Documents",
        }
      case "PENDING_REVIEW":
      case "UNDER_VERIFICATION":
        return {
          icon: Clock,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          title: "Verification In Progress",
          message: "Your documents are being reviewed",
          action: null,
        }
      default:
        return {
          icon: FileText,
          color: "text-amber-600",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          title: "Complete Your Verification",
          message: "Upload your KYC documents to activate your account",
          action: "Start Verification",
        }
    }
  }

  const kycConfig = getKYCStatusConfig()
  const KycIcon = kycConfig.icon

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

  const needsKYC = kyc?.status !== "APPROVED"

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Welcome back</h1>
        <p className="mt-2 text-slate-600">Here's an overview of your account</p>
      </div>

      {needsKYC && (
        <Card className={`rounded-2xl border ${kycConfig.borderColor} ${kycConfig.bgColor}`}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={`rounded-full p-3 ${kycConfig.bgColor}`}>
                <KycIcon className={`h-6 w-6 ${kycConfig.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{kycConfig.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{kycConfig.message}</p>
                {kycConfig.action && (
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                    {kycConfig.action}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              £{totalBalance.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {accounts.filter((a) => a.status === "ACTIVE").length}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Verification Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-lg font-semibold ${kycConfig.color}`}>
              {kyc?.status_display || "Not Started"}
            </p>
          </CardContent>
        </Card>
      </div>

      {needsKYC && kyc && (
        <KYCUpload kyc={kyc} onUpdate={fetchData} />
      )}

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
                disabled={needsKYC}
                onClick={() => (window.location.href = "/dashboard/transfers")}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Send Money
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                disabled={needsKYC}
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
            {needsKYC && (
              <p className="mt-3 text-sm text-amber-600">
                Complete verification to access all features
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
