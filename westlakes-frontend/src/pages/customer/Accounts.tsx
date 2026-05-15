import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const accounts = [
  { name: "Everyday Current", number: "**** 3482", balance: "£18,220", type: "Checking" },
  { name: "Growth Savings", number: "**** 8721", balance: "£24,150", type: "Savings" },
  { name: "Business Reserve", number: "**** 4905", balance: "£5,890", type: "Business" },
]

export default function Accounts() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Accounts</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">Your active accounts</h1>
        </div>
        <Button className="rounded-full bg-slate-950 px-6 py-3 text-white hover:bg-slate-800">Open new account</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {accounts.map((account) => (
          <Card key={account.number} className="rounded-[1.75rem] border-slate-200">
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{account.type}</p>
                <CardTitle>{account.name}</CardTitle>
              </div>
              <CardDescription>{account.number}</CardDescription>
              <div className="mt-4 text-2xl font-semibold text-slate-950">{account.balance}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Account summary</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-slate-50 p-6">
            <p className="text-sm text-slate-500">Total balance</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">£48,260</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-6">
            <p className="text-sm text-slate-500">Available credit</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">£14,500</p>
          </div>
        </div>
      </div>
    </div>
  )
}
