import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const tickets = [
  { id: "#A1024", subject: "Identity verification", priority: "High" },
  { id: "#A1031", subject: "Account closure request", priority: "Medium" },
  { id: "#A1040", subject: "Fraud investigation", priority: "High" },
]

export default function TicketManagement() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Support tickets</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Resolve customer requests fast</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="rounded-[1.75rem] border-slate-200">
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{ticket.id}</p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">{ticket.subject}</p>
                </div>
                <span className="rounded-2xl bg-slate-100 px-3 py-1 text-sm text-slate-700">{ticket.priority}</span>
              </div>
              <Button variant="outline" className="rounded-full px-4 py-2 text-slate-700 hover:bg-slate-100">Open ticket</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
