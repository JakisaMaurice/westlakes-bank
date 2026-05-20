import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { CreditCard, Loader2, Lock, Eye, EyeOff, Calendar, Wallet, ShieldCheck, AlertCircle } from "lucide-react"

interface CardInfo {
  id: number
  account_number: string
  account_type: string
  card_number: string | null
  card_cvv: string | null
  card_status: string
  card_status_label: string
  card_last_four_digits: string | null
  card_expiry: string | null
  card_daily_limit: string
  card_issued_at: string | null
  card_blocked_reason: string
}

export default function MyCards() {
  const [cards, setCards] = useState<CardInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showDetails, setShowDetails] = useState<Record<number, boolean>>({})

  const fetchCards = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get<CardInfo[]>("/api/accounts/my-cards/")
      setCards(Array.isArray(response.data) ? response.data : [])
    } catch {
      setError("Unable to load your cards.")
    } finally {
      setLoading(false)
    }
  }, [])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchCards()
  }, [fetchCards])
  /* eslint-enable react-hooks/set-state-in-effect */

  const toggleDetails = (id: number) => {
    setShowDetails((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    PENDING: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200", label: "Pending" },
    ISSUED: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", label: "Issued" },
    ACTIVE: { color: "text-green-700", bg: "bg-green-50 border-green-200", label: "Active" },
    BLOCKED: { color: "text-red-700", bg: "bg-red-50 border-red-200", label: "Blocked" },
    EXPIRED: { color: "text-orange-700", bg: "bg-orange-50 border-orange-200", label: "Expired" },
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Cards</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">My ATM Cards</h1>
        <p className="mt-1 text-slate-600">View details of your assigned ATM/debit cards</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      ) : cards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-3 text-slate-500">No ATM cards assigned yet</p>
          <p className="mt-1 text-sm text-slate-400">Cards issued by admin will appear here</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((card) => {
            const status = statusConfig[card.card_status] || statusConfig.PENDING
            const isVisible = showDetails[card.id]
            return (
              <Card key={card.id} className={`rounded-2xl ${status.bg} border`}>
                <CardContent className="space-y-4 p-5">
                  {/* Card visual header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-white/80 p-2.5 shadow-sm">
                        <CreditCard className="h-6 w-6 text-slate-700" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-slate-900">
                          {card.account_type} Account
                        </CardTitle>
                        <p className="font-mono text-xs text-slate-500">{card.account_number}</p>
                      </div>
                    </div>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color} bg-white/60`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Card number */}
                  <div className="rounded-xl bg-white/60 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Card Number</p>
                    <p className="font-mono text-lg font-semibold tracking-wider text-slate-900">
                      {card.card_number
                        ? isVisible
                          ? `${card.card_number.slice(0, 4)} ${card.card_number.slice(4, 8)} ${card.card_number.slice(8, 12)} ${card.card_number.slice(12, 16)}`
                          : `•••• •••• •••• ${card.card_number.slice(-4)}`
                        : "—"}
                    </p>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-white/50 p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <ShieldCheck className="h-3 w-3 text-slate-400" />
                        <p className="text-[10px] uppercase tracking-wider text-slate-400">CVV</p>
                      </div>
                      <p className="font-mono text-sm font-semibold text-slate-900">
                        {card.card_cvv ? (isVisible ? card.card_cvv : "•••") : "—"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white/50 p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <p className="text-[10px] uppercase tracking-wider text-slate-400">Expiry</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">
                        {card.card_expiry
                          ? new Date(card.card_expiry).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
                          : "—"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white/50 p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Wallet className="h-3 w-3 text-slate-400" />
                        <p className="text-[10px] uppercase tracking-wider text-slate-400">Daily Limit</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">
                        £{parseFloat(card.card_daily_limit).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white/50 p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <p className="text-[10px] uppercase tracking-wider text-slate-400">Issued</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">
                        {card.card_issued_at
                          ? new Date(card.card_issued_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Blocked reason */}
                  {card.card_status === "BLOCKED" && card.card_blocked_reason && (
                    <div className="flex items-start gap-2 rounded-lg bg-red-100/60 p-3">
                      <Lock className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-red-700">Card Blocked</p>
                        <p className="text-xs text-red-600 mt-0.5">{card.card_blocked_reason}</p>
                      </div>
                    </div>
                  )}

                  {/* Show/Hide button */}
                  {card.card_number && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => toggleDetails(card.id)}
                    >
                      {isVisible ? (
                        <>
                          <EyeOff className="mr-1.5 h-3.5 w-3.5" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          Show Full Details
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
