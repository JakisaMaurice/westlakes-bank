import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const approvals = [
  { name: "Ariana Green", type: "Savings account", status: "Pending" },
  { name: "Marcus Allen", type: "Business account", status: "Pending" },
  { name: "Sofia Reid", type: "Loan request", status: "Pending" },
]

export default function AccountApprovals() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Approvals</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Review account requests</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {approvals.map((request) => (
          <Card key={request.name} className="rounded-[1.75rem] border-slate-200">
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{request.type}</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">{request.name}</p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-2xl bg-slate-100 px-3 py-1 text-sm text-slate-700">{request.status}</span>
                <Button variant="outline" className="rounded-full px-4 py-2 text-slate-700 hover:bg-slate-100">View</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
