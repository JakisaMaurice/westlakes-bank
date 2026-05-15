import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"

const tickets = [
  { id: "#9221", subject: "Card activation", status: "Resolved", date: "May 7" },
  { id: "#9334", subject: "Loan inquiry", status: "In progress", date: "May 10" },
  { id: "#9378", subject: "Security alert", status: "Open", date: "May 14" },
]

export default function Tickets() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Support tickets</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Track your cases</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="rounded-[1.75rem] border-slate-200">
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>{ticket.subject}</CardTitle>
                  <CardDescription>{ticket.date}</CardDescription>
                </div>
                <span className="rounded-2xl bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                  {ticket.status}
                </span>
              </div>
              <p className="text-slate-600">Ticket {ticket.id} is being reviewed by our customer support team.</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Need help?</p>
            <p className="mt-2 text-slate-600 leading-7">Submit a new support request and our team will respond quickly.</p>
          </div>
          <Button className="rounded-full bg-slate-950 px-6 py-3 text-white hover:bg-slate-800">Create ticket</Button>
        </div>
      </div>
    </div>
  )
}
