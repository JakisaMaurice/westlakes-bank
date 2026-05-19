import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

interface TransactionRow {
  id: string
  date: string
  description: string
  category: string
  amount: string
  status: "Completed" | "Pending" | "Flagged"
}

interface TransactionsTableProps {
  rows: TransactionRow[]
}

const statusStyles = {
  Completed: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Flagged: "bg-rose-100 text-rose-700",
}

export function TransactionsTable({ rows }: TransactionsTableProps) {
  return (
    <Card className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm shadow-slate-950/5">
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-[#0F172A]">Recent transactions</CardTitle>
            <CardDescription className="text-xs text-slate-500">A snapshot of the latest account activity across your portfolio.</CardDescription>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-full bg-[#0A3D91] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#1E5EFF]">
            View history
            <ArrowRight className="size-3.5" />
          </button>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full min-w-full border-separate border-spacing-0 text-left text-xs">
            <thead className="bg-slate-950 text-white">
              <tr>
                <th className="px-3 py-2.5 font-semibold">Date</th>
                <th className="px-3 py-2.5 font-semibold">Description</th>
                <th className="px-3 py-2.5 font-semibold">Category</th>
                <th className="px-3 py-2.5 font-semibold">Amount</th>
                <th className="px-3 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="px-3 py-2 text-slate-600">{row.date}</td>
                  <td className="px-3 py-2 text-slate-900">{row.description}</td>
                  <td className="px-3 py-2 text-slate-600">{row.category}</td>
                  <td className="px-3 py-2 font-semibold text-[#0A3D91]">{row.amount}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyles[row.status]}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
