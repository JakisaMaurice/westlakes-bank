import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import {
  Search,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface Transaction {
  id: number
  transaction_type: string
  deposit_type: string | null
  deposit_type_display: string | null
  amount: string
  fee: string
  transaction_reference: string
  status: string
  timestamp: string
  description: string
  sender_account_number: string | null
  receiver_account_number: string | null
  sender_name: string | null
  receiver_name: string | null
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

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(page))
      if (search) params.set("search", search)
      if (typeFilter) params.set("type", typeFilter)
      if (statusFilter) params.set("status", statusFilter)
      if (dateFrom) params.set("date_from", dateFrom)
      if (dateTo) params.set("date_to", dateTo)

      const response = await api.get<TransactionListResponse>(
        `/api/transactions/?${params.toString()}`
      )
      setTransactions(response.data.results)
      setTotalPages(Math.ceil(response.data.count / 20))
    } catch (err) {
      console.error("Failed to fetch transactions:", err)
    } finally {
      setLoading(false)
    }
  }, [page, search, typeFilter, statusFilter, dateFrom, dateTo])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const exportCSV = () => {
    const headers = [
      "Reference",
      "Date",
      "Type",
      "Amount",
      "Fee",
      "Status",
      "Description",
      "From",
      "To",
    ]
    const rows = transactions.map((t) => [
      t.transaction_reference,
      new Date(t.timestamp).toLocaleString(),
      t.transaction_type,
      t.amount,
      t.fee,
      t.status,
      t.description,
      t.sender_account_number || "",
      t.receiver_account_number || "",
    ])

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getTransactionIcon = (type: string, isSender: boolean) => {
    switch (type) {
      case "TRANSFER":
        return isSender ? (
          <ArrowUpRight className="h-5 w-5 text-red-500" />
        ) : (
          <ArrowDownLeft className="h-5 w-5 text-green-500" />
        )
      case "DEPOSIT":
        return <ArrowDownLeft className="h-5 w-5 text-green-500" />
      case "WITHDRAWAL":
        return <ArrowUpRight className="h-5 w-5 text-red-500" />
      case "REVERSAL":
        return <RefreshCw className="h-5 w-5 text-slate-500" />
      default:
        return <ArrowUpRight className="h-5 w-5 text-slate-500" />
    }
  }

  const getAmountPrefix = (type: string, isSender: boolean) => {
    if (type === "DEPOSIT" || (!isSender && type === "TRANSFER")) return "+"
    return "-"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Transactions</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">Transaction History</h1>
        </div>
        <Button onClick={exportCSV} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by reference, description, or account..."
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
          <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-4">
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
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">From Date</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">To Date</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transactions.map((transaction) => {
                  const status = statusConfig[transaction.status] || statusConfig.PENDING
                  const isSender = !!transaction.sender_account_number

                  return (
                    <tr key={transaction.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-slate-100 p-2">
                            {getTransactionIcon(transaction.transaction_type, isSender)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {transaction.transaction_type === "TRANSFER"
                                ? isSender
                                  ? "Transfer Sent"
                                  : "Transfer Received"
                                : transaction.transaction_type}
                            </p>
                            <p className="text-sm text-slate-500">
                              {transaction.description || transaction.deposit_type_display || "-"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-slate-600">
                          {transaction.transaction_reference}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-900">
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(transaction.timestamp).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p
                          className={`font-medium ${
                            getAmountPrefix(transaction.transaction_type, isSender) === "+"
                              ? "text-green-600"
                              : "text-slate-900"
                          }`}
                        >
                          {getAmountPrefix(transaction.transaction_type, isSender)}£
                          {parseFloat(transaction.amount).toLocaleString("en-GB", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                        {parseFloat(transaction.fee) > 0 && (
                          <p className="text-xs text-slate-500">
                            Fee: £{parseFloat(transaction.fee).toFixed(2)}
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
                      <td className="px-6 py-4 text-right">
                        {transaction.balance_after && (
                          <span className="text-sm text-slate-600">
                            £{parseFloat(transaction.balance_after).toLocaleString("en-GB", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {transactions.length === 0 && (
              <div className="py-12 text-center text-slate-500">No transactions found</div>
            )}
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
    </div>
  )
}
