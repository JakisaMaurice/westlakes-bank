import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const flags = [
  { label: "Large transfer", amount: "£12,400", status: "Review" },
  { label: "International payment", amount: "£8,900", status: "Completed" },
  { label: "Rapid withdrawals", amount: "£1,840", status: "Watch" },
]

export default function TransactionMonitoring() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Transactions</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Monitor flagged activity</h1>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Transaction alerts</p>
            <p className="mt-2 text-slate-600 leading-7">Review important transactions that need administrator approval or closer inspection.</p>
          </div>
          <Button className="rounded-full bg-slate-950 px-6 py-3 text-white hover:bg-slate-800">Review all</Button>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {flags.map((item) => (
            <Card key={item.label} className="rounded-[1.75rem] border-slate-200">
              <CardContent className="space-y-4">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
                <p className="text-2xl font-semibold text-slate-950">{item.amount}</p>
                <span className="rounded-2xl bg-slate-100 px-3 py-1 text-sm text-slate-700">{item.status}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
