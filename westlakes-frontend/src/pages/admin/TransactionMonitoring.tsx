import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { api } from "@/lib/api"

interface TransactionFlag {
  id: number
  transaction_type: string
  amount: number
  status: string
  sender_account_number: string
  receiver_account_number: string
  timestamp: string
}

export default function TransactionMonitoring() {
  const [transactions, setTransactions] = useState<TransactionFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    void api
      .get<TransactionFlag[]>("/api/transactions/")
      .then((response) => setTransactions(response.data))
      .catch(() => setError("Unable to load transaction alerts."))
      .finally(() => setLoading(false))
  }, [])

  const highRisk = transactions
    .filter((item) => item.status !== "COMPLETED")
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3)

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Transactions</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Monitor flagged activity</h1>
      </div>

      {loading ? (
        <p className="text-slate-600">Loading transaction alerts...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Transaction alerts</p>
              <p className="mt-2 text-slate-600 leading-7">Review important transactions that need administrator approval or closer inspection.</p>
            </div>
            <Button className="rounded-full bg-slate-950 px-6 py-3 text-white hover:bg-slate-800">Review all</Button>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {highRisk.map((item) => (
              <Card key={item.id} className="rounded-[1.75rem] border-slate-200">
                <CardContent className="space-y-4">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{item.transaction_type}</p>
                  <p className="text-2xl font-semibold text-slate-950">{item.amount.toLocaleString("en-GB", { style: "currency", currency: "GBP" })}</p>
                  <p className="text-sm text-slate-600">{item.sender_account_number} → {item.receiver_account_number}</p>
                  <span className="rounded-2xl bg-slate-100 px-3 py-1 text-sm text-slate-700">{item.status}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
