import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { api } from "@/lib/api"

interface TicketItem {
  id: number
  subject: string
  status: string
  created_at: string
  admin_response: string
}

export default function TicketManagement() {
  const [tickets, setTickets] = useState<TicketItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    void api
      .get<TicketItem[]>("/api/tickets/")
      .then((response) => setTickets(response.data))
      .catch(() => setError("Unable to load tickets."))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Support tickets</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Resolve customer requests fast</h1>
      </div>

      {loading ? (
        <p className="text-slate-600">Loading tickets...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="rounded-[1.75rem] border-slate-200">
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">#{ticket.id}</p>
                    <p className="mt-2 text-xl font-semibold text-slate-950">{ticket.subject}</p>
                    <p className="text-sm text-slate-600">{new Date(ticket.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="rounded-2xl bg-slate-100 px-3 py-1 text-sm text-slate-700">{ticket.status}</span>
                </div>
                <p className="text-slate-600">{ticket.admin_response || "Customer is awaiting a response."}</p>
                <Button variant="outline" className="rounded-full px-4 py-2 text-slate-700 hover:bg-slate-100">Open ticket</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
