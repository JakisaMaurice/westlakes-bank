import { useEffect, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { api } from "@/lib/api"

interface Ticket {
  id: number
  subject: string
  message: string
  status: string
  admin_response: string
  created_at: string
}

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    void api
      .get<Ticket[]>("/api/tickets/")
      .then((response) => setTickets(response.data))
      .catch(() => setError("Unable to load tickets."))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSuccess("")

    try {
      const response = await api.post<Ticket>("/api/tickets/", {
        subject,
        message,
      })
      setTickets((current) => [response.data, ...current])
      setSubject("")
      setMessage("")
      setSuccess("Ticket submitted successfully.")
    } catch {
      setError("Unable to create ticket. Please try again.")
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Support tickets</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Track your cases</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Submit a new ticket</h2>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Subject</label>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Describe the issue"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Message</label>
                <textarea
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20"
                  rows={5}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Tell us what happened"
                  required
                />
              </div>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
              <Button type="submit" className="rounded-full bg-slate-950 px-6 py-3 text-white hover:bg-slate-800">
                Submit ticket
              </Button>
            </form>
          </div>

          {loading ? (
            <p className="text-slate-600">Loading tickets...</p>
          ) : (
            tickets.map((ticket) => (
              <Card key={ticket.id} className="rounded-[1.75rem] border-slate-200">
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle>{ticket.subject}</CardTitle>
                      <CardDescription>{new Date(ticket.created_at).toLocaleDateString()}</CardDescription>
                    </div>
                    <span className="rounded-2xl bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-slate-600">{ticket.message}</p>
                  {ticket.admin_response ? <p className="text-sm text-slate-700">Response: {ticket.admin_response}</p> : null}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Need help?</p>
            <p className="mt-2 text-slate-600 leading-7">Submit a support request and our team will respond quickly.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
