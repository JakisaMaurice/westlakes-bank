import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"

interface Account {
  id: number
  account_number: string
  account_type: string
  balance: number
  status: string
  created_at: string
}

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    void api
      .get<Account[]>("/api/accounts/")
      .then((response) => setAccounts(response.data))
      .catch(() => setError("Unable to load accounts."))
      .finally(() => setLoading(false))
  }, [])

  const totals = useMemo(() => {
    const total = accounts.reduce((sum, account) => sum + Number(account.balance), 0)
    return {
      total: total.toLocaleString("en-GB", { style: "currency", currency: "GBP" }),
      count: accounts.length,
    }
  }, [accounts])

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] uppercase tracking-[0.28em] text-amber-500">Accounts</p>
          <h1 className="mt-1.5 text-xl font-semibold text-slate-950">Your active accounts</h1>
        </div>
        <Button size="sm" className="rounded-full bg-slate-950 px-5 text-white hover:bg-slate-800">Open new account</Button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-600">Loading accounts...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.id} className="rounded-2xl border-slate-200">
              <CardContent className="space-y-3">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.24em] text-slate-500">{account.account_type}</p>
                  <CardTitle className="text-sm">{account.account_number}</CardTitle>
                </div>
                <CardDescription className="text-xs">{account.status}</CardDescription>
                <div className="text-lg font-semibold text-slate-950">
                  {Number(account.balance).toLocaleString("en-GB", { style: "currency", currency: "GBP" })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-[9px] uppercase tracking-[0.28em] text-amber-500">Account summary</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Total balance</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{totals.total}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Accounts open</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{totals.count}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
