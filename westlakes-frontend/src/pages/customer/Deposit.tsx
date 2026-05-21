import { useState, useEffect, useCallback, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Search,
  Clock,
  XCircle,
  CheckCheck,
  Banknote,
  Smartphone,
  Globe,
  Building2,
  Wallet,
} from "lucide-react"
import { toast } from "sonner"

interface Account {
  id: number
  account_number: string
  account_type: string
  balance: string
  status: string
}

interface DepositReceipt {
  transaction_reference: string
  amount: string
  deposit_type: string
  timestamp: string
  balance_after: string | null
}

interface DepositHistoryItem {
  id: number
  transaction_reference: string
  amount: string
  deposit_type: string
  deposit_type_display: string
  status: string
  timestamp: string
  description: string
  receiver_account_number: string
  balance_after: string | null
}

const depositSources = [
  {
    value: "CASH",
    label: "Cash Deposit",
    description: "Deposit cash at a branch or via cash deposit machine",
    icon: Banknote,
  },
  {
    value: "BANK_TRANSFER",
    label: "Bank Transfer",
    description: "Transfer from another bank account",
    icon: Building2,
  },
  {
    value: "ACCOUNT_TRANSFER",
    label: "Account Transfer",
    description: "Transfer from another Westlakes account",
    icon: Wallet,
  },
  {
    value: "MOBILE_MONEY",
    label: "Mobile Money",
    description: "Deposit via M-Pesa, MTN Mobile Money, etc.",
    icon: Smartphone,
  },
  {
    value: "ONLINE_PLATFORM",
    label: "Online Platform",
    description: "Deposit via PayPal, Stripe, or other online platforms",
    icon: Globe,
  },
]

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  PENDING: { color: "text-amber-700", bg: "bg-amber-50", label: "Pending" },
  SUCCESSFUL: { color: "text-green-700", bg: "bg-green-50", label: "Successful" },
  FAILED: { color: "text-red-700", bg: "bg-red-50", label: "Failed" },
  REVERSED: { color: "text-slate-700", bg: "bg-slate-100", label: "Reversed" },
}

export default function Deposit() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [depositType, setDepositType] = useState("CASH")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [sourceAccountNumber, setSourceAccountNumber] = useState("")
  const [sourcePlatform, setSourcePlatform] = useState("")
  const [sourceReference, setSourceReference] = useState("")
  const [error, setError] = useState("")
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [receipt, setReceipt] = useState<DepositReceipt | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const [loading, setLoading] = useState(false)

  const [deposits, setDeposits] = useState<DepositHistoryItem[]>([])
  const [depositsLoading, setDepositsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalDeposits, setTotalDeposits] = useState(0)
  const pageSize = 10

  const fetchAccounts = useCallback(async () => {
    try {
      const response = await api.get<Account[]>("/api/accounts/")
      const active = response.data.filter((a) => a.status === "ACTIVE")
      setAccounts(active)
      if (active.length > 0 && !selectedAccount) {
        setSelectedAccount(active[0])
      }
    } catch (err) {
      console.error("Failed to fetch accounts:", err)
    }
  }, [selectedAccount])

  const fetchDeposits = useCallback(async () => {
    setDepositsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("type", "DEPOSIT")
      params.set("page", String(currentPage))
      params.set("page_size", String(pageSize))
      if (searchQuery) params.set("search", searchQuery)
      if (statusFilter) params.set("status", statusFilter)
      const response = await api.get<{ results: DepositHistoryItem[]; count: number } | DepositHistoryItem[]>(
        `/api/transactions/?${params.toString()}`
      )
      if (Array.isArray(response.data)) {
        setDeposits(response.data)
        setTotalDeposits(response.data.length)
      } else {
        setDeposits(response.data.results)
        setTotalDeposits(response.data.count)
      }
    } catch (err) {
      console.error("Failed to fetch deposits:", err)
    } finally {
      setDepositsLoading(false)
    }
  }, [currentPage, searchQuery, statusFilter])

  useEffect(() => {
    fetchAccounts()
  }, [])

  useEffect(() => {
    fetchDeposits()
  }, [fetchDeposits])

  const requiresSourceFields = ["BANK_TRANSFER", "ACCOUNT_TRANSFER", "MOBILE_MONEY", "ONLINE_PLATFORM"].includes(depositType)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    if (!selectedAccount) {
      setError("Please select an account")
      return
    }

    const depositAmount = parseFloat(amount)
    if (isNaN(depositAmount) || depositAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (requiresSourceFields && !sourceReference) {
      setError("Source reference is required for this deposit type")
      return
    }

    if (depositType === "MOBILE_MONEY" && !sourcePlatform) {
      setError("Mobile money provider name is required")
      return
    }

    if (depositType === "ONLINE_PLATFORM" && !sourcePlatform) {
      setError("Platform name is required")
      return
    }

    setShowConfirmModal(true)
  }

  const handleConfirmDeposit = async () => {
    setLoading(true)
    setError("")

    try {
      const payload: Record<string, string | number> = {
        amount: parseFloat(amount),
        description,
        deposit_type: depositType,
      }

      if (sourceAccountNumber) payload.source_account_number = sourceAccountNumber
      if (sourcePlatform) payload.source_platform = sourcePlatform
      if (sourceReference) payload.source_reference = sourceReference

      const response = await api.post("/api/transactions/deposit/", payload)

      setReceipt({
        transaction_reference: response.data.transaction_reference,
        amount: response.data.amount,
        deposit_type: depositType,
        timestamp: response.data.timestamp,
        balance_after: response.data.balance_after,
      })

      setShowConfirmModal(false)
      setShowReceipt(true)
      setAmount("")
      setDescription("")
      setSourceAccountNumber("")
      setSourcePlatform("")
      setSourceReference("")
      fetchAccounts()
      toast.success("Deposit successful", {
        description: `£${parseFloat(amount).toFixed(2)} has been deposited to your account.`,
      })
      fetchDeposits()
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Deposit failed"
      setError(errorMsg)
      setShowConfirmModal(false)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalDeposits / pageSize)
  const selectedSource = depositSources.find((s) => s.value === depositType)
  const SourceIcon = selectedSource?.icon ?? Banknote

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Deposits</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Add money to your account</h1>
        <p className="mt-4 max-w-2xl text-slate-600 leading-7">
          Deposit funds from cash, bank transfers, mobile money, or online platforms.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Deposit To</label>
              <select
                value={selectedAccount?.id || ""}
                onChange={(e) => {
                  const account = accounts.find((a) => a.id === parseInt(e.target.value))
                  setSelectedAccount(account || null)
                }}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
              >
                {accounts.length === 0 && <option value="">No active accounts</option>}
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.account_number} - {account.account_type} (£
                    {parseFloat(account.balance).toLocaleString("en-GB", { minimumFractionDigits: 2 })})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Deposit Source</label>
              <div className="grid grid-cols-1 gap-2">
                {depositSources.map((source) => {
                  const Icon = source.icon
                  return (
                    <button
                      key={source.value}
                      type="button"
                      onClick={() => setDepositType(source.value)}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                        depositType === source.value
                          ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`rounded-lg p-2 ${
                          depositType === source.value ? "bg-blue-100" : "bg-slate-100"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            depositType === source.value ? "text-blue-600" : "text-slate-500"
                          }`}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            depositType === source.value ? "text-blue-900" : "text-slate-900"
                          }`}
                        >
                          {source.label}
                        </p>
                        <p className="text-xs text-slate-500">{source.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">£</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min={0.01}
                  step="0.01"
                  className="pl-8"
                />
              </div>
            </div>

            {depositType === "MOBILE_MONEY" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Mobile Money Provider
                </label>
                <Input
                  type="text"
                  placeholder="e.g., M-Pesa, MTN Mobile Money, Airtel Money"
                  value={sourcePlatform}
                  onChange={(e) => setSourcePlatform(e.target.value)}
                  required
                />
              </div>
            )}

            {depositType === "ONLINE_PLATFORM" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Platform Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g., PayPal, Stripe, Wise"
                  value={sourcePlatform}
                  onChange={(e) => setSourcePlatform(e.target.value)}
                  required
                />
              </div>
            )}

            {depositType === "ACCOUNT_TRANSFER" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Source Account Number
                </label>
                <Input
                  type="text"
                  placeholder="Enter the Westlakes account number you're transferring from"
                  value={sourceAccountNumber}
                  onChange={(e) => setSourceAccountNumber(e.target.value)}
                />
              </div>
            )}

            {depositType === "BANK_TRANSFER" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Source Bank Details
                </label>
                <Input
                  type="text"
                  placeholder="Enter the bank name or account details"
                  value={sourceAccountNumber}
                  onChange={(e) => setSourceAccountNumber(e.target.value)}
                />
              </div>
            )}

            {requiresSourceFields && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Transaction Reference <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter the reference ID from your source"
                  value={sourceReference}
                  onChange={(e) => setSourceReference(e.target.value)}
                  required
                />
                <p className="mt-1 text-xs text-slate-500">
                  Find this in your bank statement, mobile money receipt, or platform transaction history
                </p>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Note / Description
              </label>
              <Textarea
                placeholder="Add a note for this deposit..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full rounded-lg bg-slate-950 py-3 text-white hover:bg-slate-800"
              disabled={loading || accounts.length === 0}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="font-semibold text-slate-900">Deposit Summary</h3>
            {selectedAccount && (
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Current balance</span>
                  <span className="font-medium text-slate-900">
                    £{parseFloat(selectedAccount.balance).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {amount && parseFloat(amount) > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Deposit amount</span>
                      <span className="text-green-600">+£{parseFloat(amount).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">New balance</span>
                        <span className="font-medium text-slate-900">
                          £
                          {(
                            parseFloat(selectedAccount.balance) + parseFloat(amount)
                          ).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </>
                )}
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <SourceIcon className="h-4 w-4" />
                    <span>{selectedSource?.label}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="font-semibold text-slate-900">Deposit Guide</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                Cash deposits are processed instantly at any branch
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                Bank transfers may take 1-3 business days to clear
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                Mobile money deposits are processed within minutes
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                Always include the correct reference number for tracking
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Deposit History */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Deposit History</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search deposits..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 w-48"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="SUCCESSFUL">Successful</option>
              <option value="FAILED">Failed</option>
              <option value="REVERSED">Reversed</option>
            </select>
          </div>
        </div>

        {depositsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : deposits.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white py-12 text-center">
            <p className="text-slate-500">No deposits found</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Reference
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {deposits.map((deposit) => {
                  const config = statusConfig[deposit.status] || statusConfig.PENDING
                  return (
                    <tr key={deposit.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs text-slate-600">
                          {deposit.transaction_reference}
                        </p>
                        {deposit.description && (
                          <p className="mt-0.5 text-xs text-slate-400 truncate max-w-[150px]">
                            {deposit.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-slate-900">
                          {deposit.deposit_type_display || deposit.deposit_type}
                        </p>
                        <p className="font-mono text-xs text-slate-400">
                          {deposit.receiver_account_number}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-green-600">
                          +£{parseFloat(deposit.amount).toFixed(2)}
                        </p>
                        {deposit.balance_after && (
                          <p className="text-xs text-slate-400">
                            Bal: £{parseFloat(deposit.balance_after).toFixed(2)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.color} ${config.bg}`}
                        >
                          {deposit.status === "PENDING" && <Clock className="h-3 w-3" />}
                          {deposit.status === "SUCCESSFUL" && (
                            <CheckCheck className="h-3 w-3" />
                          )}
                          {deposit.status === "FAILED" && <XCircle className="h-3 w-3" />}
                          {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-slate-600">
                          {new Date(deposit.timestamp).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(deposit.timestamp).toLocaleTimeString()}
                        </p>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
                <p className="text-sm text-slate-500">
                  Showing {(currentPage - 1) * pageSize + 1}–
                  {Math.min(currentPage * pageSize, totalDeposits)} of {totalDeposits}
                </p>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deposit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Amount</span>
                <span className="font-medium">£{parseFloat(amount || "0").toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Source</span>
                <span className="font-medium">{selectedSource?.label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">To Account</span>
                <span className="font-mono font-medium">{selectedAccount?.account_number}</span>
              </div>
              {sourcePlatform && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Provider</span>
                  <span className="font-medium">{sourcePlatform}</span>
                </div>
              )}
              {sourceReference && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Reference</span>
                  <span className="font-mono">{sourceReference}</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDeposit}
              disabled={loading}
              className="bg-slate-950 hover:bg-slate-800"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Deposit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deposit Successful</DialogTitle>
          </DialogHeader>
          {receipt && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Reference</span>
                  <span className="font-mono font-medium">{receipt.transaction_reference}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Amount</span>
                  <span className="font-medium text-green-600">
                    +£{parseFloat(receipt.amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Source</span>
                  <span className="font-medium">
                    {depositSources.find((s) => s.value === receipt.deposit_type)?.label}
                  </span>
                </div>
                {receipt.balance_after && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">New Balance</span>
                    <span className="font-medium">£{parseFloat(receipt.balance_after).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Date</span>
                  <span>{new Date(receipt.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowReceipt(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
