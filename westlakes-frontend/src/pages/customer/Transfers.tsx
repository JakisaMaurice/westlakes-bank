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
import { Loader2, CheckCircle, AlertCircle, ArrowRight, Search, Clock, XCircle, CheckCheck } from "lucide-react"
import { toast } from "sonner"

interface Account {
  id: number
  account_number: string
  account_type: string
  balance: string
  status: string
}

interface TransferReceipt {
  transaction_reference: string
  amount: string
  fee: string
  recipient_name: string
  recipient_account: string
  timestamp: string
}

interface TransferHistoryItem {
  id: number
  transaction_reference: string
  amount: string
  fee: string
  status: string
  timestamp: string
  description: string
  sender_account_number: string
  receiver_account_number: string
  receiver_name: string
}

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  PENDING: { color: "text-amber-700", bg: "bg-amber-50", label: "Pending" },
  SUCCESSFUL: { color: "text-green-700", bg: "bg-green-50", label: "Successful" },
  FAILED: { color: "text-red-700", bg: "bg-red-50", label: "Failed" },
  REVERSED: { color: "text-slate-700", bg: "bg-slate-100", label: "Reversed" },
}

export default function Transfers() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [receiverAccount, setReceiverAccount] = useState("")
  const [receiverName, setReceiverName] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")
  const [validating, setValidating] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [transactionPin, setTransactionPin] = useState("")
  const [pinError, setPinError] = useState("")
  const [receipt, setReceipt] = useState<TransferReceipt | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const [loading, setLoading] = useState(false)

  // Transfer history state
  const [transfers, setTransfers] = useState<TransferHistoryItem[]>([])
  const [transfersLoading, setTransfersLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalTransfers, setTotalTransfers] = useState(0)
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

  const fetchTransfers = useCallback(async () => {
    setTransfersLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("type", "TRANSFER")
      params.set("page", String(currentPage))
      params.set("page_size", String(pageSize))
      if (searchQuery) params.set("search", searchQuery)
      if (statusFilter) params.set("status", statusFilter)
      const response = await api.get<{ results: TransferHistoryItem[]; count: number } | TransferHistoryItem[]>(`/api/transactions/?${params.toString()}`)
      if (Array.isArray(response.data)) {
        setTransfers(response.data)
        setTotalTransfers(response.data.length)
      } else {
        setTransfers(response.data.results)
        setTotalTransfers(response.data.count)
      }
    } catch (err) {
      console.error("Failed to fetch transfers:", err)
    } finally {
      setTransfersLoading(false)
    }
  }, [currentPage, searchQuery, statusFilter])

  useEffect(() => {
    fetchAccounts()
  }, [])

  useEffect(() => {
    fetchTransfers()
  }, [fetchTransfers])

  const validateAccount = async (accountNumber: string) => {
    if (!accountNumber || accountNumber.length < 10) {
      setReceiverName("")
      return
    }

    setValidating(true)
    try {
      const response = await api.get(`/api/accounts/?search=${accountNumber}`)
      const account = response.data.find((a: Account) => a.account_number === accountNumber)
      if (account) {
        setReceiverName(account.account_type + " Account")
      } else {
        setReceiverName("")
      }
    } catch {
      setReceiverName("")
    } finally {
      setValidating(false)
    }
  }

  const handleAccountChange = (value: string) => {
    setReceiverAccount(value)
    validateAccount(value)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    if (!selectedAccount) {
      setError("Please select an account")
      return
    }

    if (!receiverAccount) {
      setError("Please enter a recipient account number")
      return
    }

    const transferAmount = parseFloat(amount)
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (transferAmount > parseFloat(selectedAccount.balance)) {
      setError("Insufficient balance")
      return
    }

    setShowPinModal(true)
  }

  const handleConfirmTransfer = async () => {
    if (!transactionPin || transactionPin.length < 4) {
      setPinError("Please enter your transaction PIN")
      return
    }

    setLoading(true)
    setPinError("")

    try {
      const response = await api.post("/api/transactions/transfer/", {
        sender_account_id: selectedAccount?.id,
        receiver_account_number: receiverAccount,
        amount: parseFloat(amount),
        description,
        transaction_pin: transactionPin,
      })

      setReceipt({
        transaction_reference: response.data.transaction_reference,
        amount: response.data.amount,
        fee: response.data.fee || "0",
        recipient_name: response.data.receiver_name || receiverName,
        recipient_account: receiverAccount,
        timestamp: response.data.timestamp,
      })

      setShowPinModal(false)
      setShowReceipt(true)
      setReceiverAccount("")
      setReceiverName("")
      setAmount("")
      setDescription("")
      setTransactionPin("")
      fetchAccounts()
      toast.success("Transfer confirmation email sent", { description: "A notification has been sent to your email address." })
      fetchTransfers()
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Transfer failed"
      if (errorMsg.includes("PIN")) {
        setPinError(errorMsg)
      } else {
        setError(errorMsg)
        setShowPinModal(false)
      }
    } finally {
      setLoading(false)
    }
  }

  const calculateFee = (amt: string) => {
    const value = parseFloat(amt) || 0
    if (value <= 100) return 0.50
    if (value <= 1000) return 1.00
    if (value <= 10000) return 2.50
    return 5.00
  }

  const fee = calculateFee(amount)
  const totalCost = (parseFloat(amount) || 0) + fee
  const totalPages = Math.ceil(totalTransfers / pageSize)

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Transfers</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Send money securely</h1>
        <p className="mt-4 max-w-2xl text-slate-600 leading-7">
          Transfer funds to other accounts with secure PIN confirmation and real-time processing.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">From Account</label>
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
                    {account.account_number} - {account.account_type} (£{parseFloat(account.balance).toLocaleString("en-GB", { minimumFractionDigits: 2 })})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Recipient Account Number
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter account number"
                  value={receiverAccount}
                  onChange={(e) => handleAccountChange(e.target.value)}
                  required
                  className="pr-10"
                />
                {validating && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
                )}
              </div>
              {receiverName && (
                <p className="mt-1 text-sm text-green-600">{receiverName}</p>
              )}
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
              {amount && parseFloat(amount) > 0 && (
                <div className="mt-2 rounded-lg bg-slate-50 p-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Transfer amount</span>
                    <span>£{parseFloat(amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Transfer fee</span>
                    <span>£{fee.toFixed(2)}</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 font-medium text-slate-900">
                    <span>Total</span>
                    <span>£{totalCost.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Reference / Note
              </label>
              <Textarea
                placeholder="Add a reference for this transfer..."
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
              Continue to Confirmation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="font-semibold text-slate-900">Transfer Summary</h3>
            {selectedAccount && (
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Available balance</span>
                  <span className="font-medium text-slate-900">
                    £{parseFloat(selectedAccount.balance).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {amount && parseFloat(amount) > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Transfer amount</span>
                      <span className="text-slate-900">£{parseFloat(amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Fee</span>
                      <span className="text-slate-900">£{fee.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Remaining balance</span>
                        <span className="font-medium text-slate-900">
                          £{(parseFloat(selectedAccount.balance) - totalCost).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="font-semibold text-slate-900">Transfer Tips</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                Verify the recipient account number before confirming
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                Transfers are processed instantly during business hours
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                You'll receive a confirmation notification after the transfer
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Transfer History */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Transfer History</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search transfers..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                className="pl-10 w-48"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
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

        {transfersLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : transfers.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white py-12 text-center">
            <p className="text-slate-500">No transfers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Reference</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">From</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">To</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {transfers.map((transfer) => {
                    const config = statusConfig[transfer.status] || statusConfig.PENDING
                    return (
                      <tr key={transfer.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-mono text-xs text-slate-600">{transfer.transaction_reference}</p>
                          {transfer.description && (
                            <p className="mt-0.5 text-xs text-slate-400 truncate max-w-[150px]">{transfer.description}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-mono text-xs text-slate-600">{transfer.sender_account_number || "—"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-mono text-xs text-slate-600">{transfer.receiver_account_number || "—"}</p>
                          {transfer.receiver_name && (
                            <p className="text-xs text-slate-400">{transfer.receiver_name}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-900">£{parseFloat(transfer.amount).toFixed(2)}</p>
                          {parseFloat(transfer.fee) > 0 && (
                            <p className="text-xs text-slate-400">fee: £{parseFloat(transfer.fee).toFixed(2)}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.color} ${config.bg}`}>
                            {transfer.status === "PENDING" && <Clock className="h-3 w-3" />}
                            {transfer.status === "SUCCESSFUL" && <CheckCheck className="h-3 w-3" />}
                            {transfer.status === "FAILED" && <XCircle className="h-3 w-3" />}
                            {config.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-slate-600">{new Date(transfer.timestamp).toLocaleDateString()}</p>
                          <p className="text-xs text-slate-400">{new Date(transfer.timestamp).toLocaleTimeString()}</p>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
                <p className="text-sm text-slate-500">
                  Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalTransfers)} of {totalTransfers}
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

      {/* PIN Confirmation Modal */}
      <Dialog open={showPinModal} onOpenChange={setShowPinModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Transfer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Amount</span>
                <span className="font-medium">£{parseFloat(amount || "0").toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Fee</span>
                <span className="font-medium">£{fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">To</span>
                <span className="font-medium">{receiverAccount}</span>
              </div>
              {receiverName && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Recipient</span>
                  <span className="font-medium">{receiverName}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Enter Transaction PIN
              </label>
              <Input
                type="password"
                value={transactionPin}
                onChange={(e) => setTransactionPin(e.target.value)}
                placeholder="Enter your 4-6 digit PIN"
                maxLength={6}
                className="text-center text-2xl tracking-widest"
              />
              {pinError && <p className="mt-1 text-sm text-red-600">{pinError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPinModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmTransfer}
              disabled={loading}
              className="bg-slate-950 hover:bg-slate-800"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Transfer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Successful</DialogTitle>
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
                  <span className="font-medium">£{parseFloat(receipt.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Fee</span>
                  <span className="font-medium">£{parseFloat(receipt.fee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Recipient</span>
                  <span className="font-medium">{receipt.recipient_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Account</span>
                  <span className="font-mono">{receipt.recipient_account}</span>
                </div>
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
