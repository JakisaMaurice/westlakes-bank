import { useEffect, useState, useCallback } from "react"
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
  Search,
  Filter,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface Transaction {
  id: number
  sender_account_number: string | null
  receiver_account_number: string | null
  sender_name: string | null
  receiver_name: string | null
  transaction_type: string
  deposit_type: string | null
  deposit_type_display: string | null
  amount: string
  fee: string
  transaction_reference: string
  status: string
  timestamp: string
  description: string
  balance_after: string | null
}

interface TransactionListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Transaction[]
}

const statusConfig: Record<string, { color: string; label: string }> = {
  PENDING: { color: "bg-amber-100 text-amber-700", label: "Pending" },
  SUCCESSFUL: { color: "bg-green-100 text-green-700", label: "Successful" },
  FAILED: { color: "bg-red-100 text-red-700", label: "Failed" },
  REVERSED: { color: "bg-slate-100 text-slate-700", label: "Reversed" },
}

export default function TransactionMonitoring() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [reverseModalOpen, setReverseModalOpen] = useState(false)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [reverseReason, setReverseReason] = useState("")
  const [processing, setProcessing] = useState(false)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(page))
      if (search) params.set("search", search)
      if (typeFilter) params.set("type", typeFilter)
      if (statusFilter) params.set("status", statusFilter)

      const response = await api.get<TransactionListResponse>(
        `/api/transactions/?${params.toString()}`
      )
      setTransactions(response.data.results)
      setTotalPages(Math.ceil(response.data.count / 20))
    } catch {
      console.error("Failed to fetch transactions")
    } finally {
      setLoading(false)
    }
  }, [page, search, typeFilter, statusFilter])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const handleReverse = async () => {
    if (!selectedTx || !reverseReason.trim()) return
    setProcessing(true)
    try {
      await api.post(`/api/transactions/${selectedTx.id}/reverse/`, {
        reason: reverseReason,
      })
      setReverseModalOpen(false)
      setSelectedTx(null)
      setReverseReason("")
      fetchTransactions()
    } catch (err: any) {
      console.error("Failed to reverse transaction:", err)
    } finally {
      setProcessing(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "TRANSFER":
        return <ArrowUpRight className="h-4 w-4 text-blue-500" />
      case "DEPOSIT":
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />
      case "WITHDRAWAL":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />
      case "REVERSAL":
        return <RefreshCw className="h-4 w-4 text-slate-500" />
      default:
        return <ArrowUpRight className="h-4 w-4 text-slate-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Transactions</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Transaction Monitoring</h1>
        <p className="mt-1 text-slate-600">Monitor and manage all transactions across the platform</p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by reference, account number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">All Types</option>
                <option value="DEPOSIT">Deposit</option>
                <option value="WITHDRAWAL">Withdrawal</option>
                <option value="TRANSFER">Transfer</option>
                <option value="REVERSAL">Reversal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="SUCCESSFUL">Successful</option>
                <option value="FAILED">Failed</option>
                <option value="REVERSED">Reversed</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center">
          <p className="text-slate-500">No transactions found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    From
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    To
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transactions.map((tx) => {
                  const status = statusConfig[tx.status] || statusConfig.PENDING
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-slate-100 p-2">
                            {getTransactionIcon(tx.transaction_type)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {tx.transaction_type}
                            </p>
                            <p className="font-mono text-xs text-slate-500">
                              {tx.transaction_reference}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-900">
                          {tx.sender_account_number || "—"}
                        </p>
                        {tx.sender_name && (
                          <p className="text-xs text-slate-500">{tx.sender_name}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-900">
                          {tx.receiver_account_number || "—"}
                        </p>
                        {tx.receiver_name && (
                          <p className="text-xs text-slate-500">{tx.receiver_name}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-medium text-slate-900">
                          £{parseFloat(tx.amount).toLocaleString("en-GB", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                        {parseFloat(tx.fee) > 0 && (
                          <p className="text-xs text-slate-500">
                            Fee: £{parseFloat(tx.fee).toFixed(2)}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-900">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(tx.timestamp).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {tx.status === "SUCCESSFUL" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedTx(tx)
                              setReverseModalOpen(true)
                            }}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <RefreshCw className="mr-1 h-3.5 w-3.5" />
                            Reverse
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Reverse Modal */}
      <Dialog open={reverseModalOpen} onOpenChange={setReverseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reverse Transaction</DialogTitle>
          </DialogHeader>
          {selectedTx && (
            <div className="space-y-4">
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Reference</span>
                  <span className="font-mono font-medium">{selectedTx.transaction_reference}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Amount</span>
                  <span className="font-medium">£{parseFloat(selectedTx.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Type</span>
                  <span className="font-medium">{selectedTx.transaction_type}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Reason for Reversal <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={reverseReason}
                  onChange={(e) => setReverseReason(e.target.value)}
                  placeholder="Explain why this transaction is being reversed..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReverseModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReverse}
              disabled={!reverseReason.trim() || processing}
            >
              {processing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <AlertTriangle className="mr-2 h-4 w-4" />
              )}
              Reverse Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
