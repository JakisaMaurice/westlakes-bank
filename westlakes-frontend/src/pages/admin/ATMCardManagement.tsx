import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import { Search, CreditCard, Loader2, Lock, Unlock, Eye, EyeOff, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Modal } from "@/components/admin/AdminUI"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface CardAccount {
  id: number
  user: number
  user_name: string
  account_number: string
  account_type: string
  account_type_display: string
  balance: string
  status: string
  card_number: string | null
  card_status: string
  card_status_label: string
  card_last_four_digits: string | null
  card_expiry: string | null
  card_daily_limit: string
  card_issued_at: string | null
  card_blocked_reason: string
  created_at: string
}

const cardStatusConfig: Record<string, { color: string; label: string }> = {
  NOT_ISSUED: { color: "bg-slate-100 text-slate-600", label: "Not Issued" },
  PENDING: { color: "bg-amber-100 text-amber-700", label: "Pending" },
  ISSUED: { color: "bg-blue-100 text-blue-700", label: "Issued" },
  ACTIVE: { color: "bg-green-100 text-green-700", label: "Active" },
  BLOCKED: { color: "bg-red-100 text-red-700", label: "Blocked" },
  EXPIRED: { color: "bg-orange-100 text-orange-700", label: "Expired" },
}

const PAGE_SIZE = 10

export default function ATMCardManagement() {
  const [accounts, setAccounts] = useState<CardAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [selectedCard, setSelectedCard] = useState<CardAccount | null>(null)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [blockReason, setBlockReason] = useState("")
  const [processing, setProcessing] = useState(false)
  const [showCardNumber, setShowCardNumber] = useState<Record<number, boolean>>({})

  const fetchAccounts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      const response = await api.get<CardAccount[]>(`/api/accounts/atm-cards/?${params.toString()}`)
      setAccounts(Array.isArray(response.data) ? response.data : [])
    } catch {
      setError("Unable to load accounts.")
    } finally {
      setLoading(false)
    }
  }, [search])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])
  /* eslint-enable react-hooks/set-state-in-effect */

  const issueCard = async (accountId: number) => {
    setProcessing(true)
    try {
      await api.post(`/api/accounts/${accountId}/atm-card/issue/`)
      setShowIssueModal(false)
      fetchAccounts()
    } catch (err: any) {
      setError(err?.response?.data?.error || "Unable to issue card.")
    } finally {
      setProcessing(false)
    }
  }

  const handleBlock = async () => {
    if (!selectedCard) return
    setProcessing(true)
    try {
      await api.post(`/api/accounts/${selectedCard.id}/atm-card/block/`, { reason: blockReason })
      setShowBlockModal(false)
      setSelectedCard(null)
      setBlockReason("")
      fetchAccounts()
    } catch (err: any) {
      setError(err?.response?.data?.error || "Unable to block card.")
    } finally {
      setProcessing(false)
    }
  }

  const unblockCard = async (accountId: number) => {
    setProcessing(true)
    try {
      await api.post(`/api/accounts/${accountId}/atm-card/unblock/`)
      fetchAccounts()
    } catch (err: any) {
      setError(err?.response?.data?.error || "Unable to unblock card.")
    } finally {
      setProcessing(false)
    }
  }

  const toggleCardNumber = (id: number) => {
    setShowCardNumber((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const formatCardNumber = (num: string | null, show: boolean) => {
    if (!num) return "—"
    if (show) return `${num.slice(0, 4)} ${num.slice(4, 8)} ${num.slice(8, 12)} ${num.slice(12, 16)}`
    return `•••• •••• •••• ${num.slice(-4)}`
  }

  // Filter accounts
  const filtered = accounts.filter((a) => {
    if (statusFilter === "no_card") return a.card_status === "NOT_ISSUED" && a.status === "ACTIVE"
    if (statusFilter === "active") return a.card_status === "ACTIVE"
    if (statusFilter === "blocked") return a.card_status === "BLOCKED"
    if (statusFilter === "issued") return a.card_status !== "NOT_ISSUED"
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const activeCount = accounts.filter((c) => c.card_status === "ACTIVE").length
  const blockedCount = accounts.filter((c) => c.card_status === "BLOCKED").length
  const noCardCount = accounts.filter((c) => c.card_status === "NOT_ISSUED" && c.status === "ACTIVE").length
  const issuedCount = accounts.filter((c) => c.card_status !== "NOT_ISSUED").length

  const filterTabs = [
    { key: "all", label: "All", count: accounts.length },
    { key: "no_card", label: "No Card", count: noCardCount },
    { key: "active", label: "Active", count: activeCount },
    { key: "blocked", label: "Blocked", count: blockedCount },
    { key: "issued", label: "Issued", count: issuedCount },
  ]

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-amber-500">ATM Cards</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">ATM Card Management</h1>
        <p className="mt-1 text-sm text-slate-500">Issue, block, and manage customer ATM/debit cards</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-green-200 bg-green-50/50 p-3 shadow-sm">
          <p className="text-[10px] font-medium uppercase tracking-wider text-green-600">Active</p>
          <p className="mt-1 text-xl font-semibold text-green-700">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-3 shadow-sm">
          <p className="text-[10px] font-medium uppercase tracking-wider text-red-600">Blocked</p>
          <p className="mt-1 text-xl font-semibold text-red-700">{blockedCount}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 shadow-sm">
          <p className="text-[10px] font-medium uppercase tracking-wider text-amber-600">No Card</p>
          <p className="mt-1 text-xl font-semibold text-amber-700">{noCardCount}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 shadow-sm">
          <p className="text-[10px] font-medium uppercase tracking-wider text-blue-600">Issued</p>
          <p className="mt-1 text-xl font-semibold text-blue-700">{issuedCount}</p>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setStatusFilter(tab.key); setPage(1) }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                statusFilter === tab.key
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                statusFilter === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search customer or account..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-10 h-9"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center">
          <CreditCard className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-2 text-slate-500">No accounts found</p>
          <p className="mt-1 text-sm text-slate-400">Try adjusting your filters or search term</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Customer</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Account</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Card Number</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Daily Limit</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Expiry</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paged.map((item) => {
                  const statusCfg = cardStatusConfig[item.card_status] || cardStatusConfig.NOT_ISSUED
                  const isNoCard = item.card_status === "NOT_ISSUED"
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-900">{item.user_name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs text-slate-600">{item.account_number}</p>
                        <p className="text-[10px] text-slate-400">{item.account_type_display}</p>
                      </td>
                      <td className="px-4 py-3">
                        {isNoCard ? (
                          <span className="text-xs text-slate-400">No card</span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <p className="font-mono text-xs text-slate-700">
                              {formatCardNumber(item.card_number, showCardNumber[item.id])}
                            </p>
                            {item.card_number && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button onClick={() => toggleCardNumber(item.id)} className="text-slate-400 hover:text-slate-600">
                                    {showCardNumber[item.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">{showCardNumber[item.id] ? "Hide" : "Show"}</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                        {item.card_status === "BLOCKED" && item.card_blocked_reason && (
                          <p className="mt-0.5 text-[10px] text-red-500 max-w-[120px] truncate" title={item.card_blocked_reason}>
                            {item.card_blocked_reason}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-slate-700">
                          £{parseFloat(item.card_daily_limit).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-slate-600">
                          {item.card_expiry
                            ? new Date(item.card_expiry).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
                            : "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {isNoCard && item.status === "ACTIVE" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" onClick={() => { setSelectedCard(item); setShowIssueModal(true) }} disabled={processing} className="bg-green-600 hover:bg-green-700 h-7 px-2.5 text-[11px]">
                                  <CreditCard className="mr-1 h-3 w-3" />
                                  Issue
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">Issue ATM card</TooltipContent>
                            </Tooltip>
                          )}
                          {item.card_status === "ACTIVE" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 h-7 px-2.5 text-[11px]" onClick={() => { setSelectedCard(item); setBlockReason(""); setShowBlockModal(true) }}>
                                  <Lock className="mr-1 h-3 w-3" />
                                  Block
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">Block this card</TooltipContent>
                            </Tooltip>
                          )}
                          {item.card_status === "BLOCKED" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50 h-7 px-2.5 text-[11px]" onClick={() => unblockCard(item.id)} disabled={processing}>
                                  <Unlock className="mr-1 h-3 w-3" />
                                  Unblock
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">Unblock this card</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-8 w-8 rounded-lg text-xs font-medium transition ${
                      p === safePage
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Issue Card Modal */}
      <Modal open={showIssueModal} onClose={() => setShowIssueModal(false)} title="Issue ATM Card" size="sm">
        {selectedCard && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Customer</span>
                <span className="font-medium text-slate-900">{selectedCard.user_name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Account</span>
                <span className="font-mono text-slate-900">{selectedCard.account_number}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Type</span>
                <span className="text-slate-900">{selectedCard.account_type_display}</span>
              </div>
            </div>
            <p className="text-xs text-slate-400">A 16-digit card number and CVV will be generated. Card activates immediately with a 4-year expiry.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowIssueModal(false)}>Cancel</Button>
              <Button onClick={() => selectedCard && issueCard(selectedCard.id)} disabled={processing} className="bg-green-600 hover:bg-green-700">
                {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                Issue Card
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Block Modal */}
      <Modal open={showBlockModal} onClose={() => { setShowBlockModal(false); setBlockReason("") }} title="Block ATM Card" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            {selectedCard && (
              <>Block the card for <span className="font-medium text-slate-900">{selectedCard.user_name}</span> — <span className="font-mono">{selectedCard.account_number}</span>?</>
            )}
          </p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason <span className="text-red-500">*</span></label>
            <Textarea value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="e.g., Suspected fraud, Lost card..." />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setShowBlockModal(false); setBlockReason("") }}>Cancel</Button>
            <Button variant="destructive" onClick={handleBlock} disabled={processing || !blockReason.trim()}>
              {processing ? "Blocking..." : "Block Card"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
