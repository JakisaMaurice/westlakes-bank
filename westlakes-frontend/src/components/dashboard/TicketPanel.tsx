import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
// import { MessageSquare } from "lucide-react"

interface TicketRow {
  id: string
  customer: string
  subject: string
  queue: string
  status: "Open" | "Pending" | "Resolved"
}

const statusMap = {
  Open: "bg-amber-100 text-amber-800",
  Pending: "bg-sky-100 text-sky-800",
  Resolved: "bg-emerald-100 text-emerald-800",
}

interface TicketPanelProps {
  tickets: TicketRow[]
}

export function TicketPanel({ tickets }: TicketPanelProps) {
  return (
    <Card className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm shadow-slate-950/5">
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-[#0F172A]">Ticket management</CardTitle>
            <CardDescription className="text-xs text-slate-500">Track service requests and support queues at a glance.</CardDescription>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E6EEFF] px-2.5 py-1 text-[10px] font-semibold text-[#0A3D91]">
            {/* <MessageSquare className="size-3.5" /> 4 active tickets */}
          </div>
        </div>
        <div className="grid gap-2">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-[#1E293B]">{ticket.subject}</p>
                  <p className="text-[11px] text-slate-500">{ticket.customer} · {ticket.queue}</p>
                </div>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusMap[ticket.status]}`}>{ticket.status}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
