import { useEffect, useState } from "react"
import { api } from "@/lib/api"

interface Transaction {
  id: number
  transaction_type: string
  amount: number
  description: string
  status: string
  timestamp: string
  sender_account_number?: string
  receiver_account_number?: string
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    void api
      .get<Transaction[]>("/api/transactions/")
      .then((response) => setTransactions(response.data))
      .catch(() => setError("Unable to load transactions."))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Transactions</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Recent activity</h1>
      </div>

      {loading ? (
        <p className="text-slate-600">Loading transactions...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Description</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Amount</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 text-sm text-slate-700">{new Date(transaction.timestamp).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{transaction.description || transaction.transaction_type}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-950">
                    {transaction.amount.toLocaleString("en-GB", { style: "currency", currency: "GBP" })}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{transaction.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
