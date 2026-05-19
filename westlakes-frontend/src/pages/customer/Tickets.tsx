import { useEffect, useState, useCallback, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import { Loader2, Send, Clock, CheckCircle, AlertCircle, XCircle, MessageSquare } from "lucide-react"

interface TicketReply {
  id: number
  author: number
  author_name: string
  message: string
  is_admin_reply: boolean
  created_at: string
}

interface Ticket {
  id: number
  subject: string
  message: string
  status: string
  admin_response: string
  replies: TicketReply[]
  created_at: string
  updated_at: string
}

const statusConfig: Record<string, { color: string; label: string; icon: typeof Clock }> = {
  OPEN: { color: "bg-amber-100 text-amber-700", label: "Open", icon: AlertCircle },
  IN_PROGRESS: { color: "bg-blue-100 text-blue-700", label: "In Progress", icon: Clock },
  RESOLVED: { color: "bg-green-100 text-green-700", label: "Resolved", icon: CheckCircle },
  CLOSED: { color: "bg-slate-100 text-slate-700", label: "Closed", icon: XCircle },
}

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [replyText, setReplyText] = useState("")
  const [replying, setReplying] = useState(false)

  const fetchTickets = useCallback(async () => {
    try {
      const response = await api.get<Ticket[]>("/api/tickets/")
      setTickets(response.data)
    } catch {
      setError("Unable to load tickets.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setSuccess("")

    try {
      const response = await api.post<Ticket>("/api/tickets/", { subject, message })
      setTickets((current) => [response.data, ...current])
      setSubject("")
      setMessage("")
      setSuccess("Ticket submitted successfully.")
    } catch (err: any) {
      setError(err.response?.data?.error || "Unable to create ticket. Please try again.")
    }
  }

  const openTicket = async (ticket: Ticket) => {
    try {
      const response = await api.get<Ticket>(`/api/tickets/${ticket.id}/`)
      setSelectedTicket(response.data)
    } catch {
      setError("Failed to load ticket details.")
    }
  }

  const handleReply = async () => {
    if (!selectedTicket || !replyText.trim()) return
    setReplying(true)
    try {
      await api.post(`/api/tickets/${selectedTicket.id}/reply/`, { message: replyText })
      setReplyText("")
      const response = await api.get<Ticket>(`/api/tickets/${selectedTicket.id}/`)
      setSelectedTicket(response.data)
      fetchTickets()
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send reply.")
    } finally {
      setReplying(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Support</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Support Tickets</h1>
        <p className="mt-1 text-slate-600">Submit and track your support requests</p>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-6">
          {/* New ticket form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Submit a New Ticket</h2>
            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Subject</label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-300/20"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Brief description of your issue"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Message</label>
                <textarea
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-300/20"
                  rows={4}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Describe your issue in detail..."
                  required
                />
              </div>
              {success && <p className="text-sm text-emerald-600">{success}</p>}
              <Button type="submit" className="bg-slate-950 hover:bg-slate-800">
                Submit Ticket
              </Button>
            </form>
          </div>

          {/* Ticket list */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 text-slate-500">No tickets yet</p>
            </div>
          ) : (
            tickets.map((ticket) => {
              const status = statusConfig[ticket.status] || statusConfig.OPEN
              const StatusIcon = status.icon
              return (
                <Card
                  key={ticket.id}
                  className={`cursor-pointer transition hover:shadow-md ${
                    selectedTicket?.id === ticket.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => openTicket(ticket)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-slate-500">#{ticket.id}</p>
                          <Badge className={status.color}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {status.label}
                          </Badge>
                        </div>
                        <CardTitle className="mt-1 text-base">{ticket.subject}</CardTitle>
                        <CardDescription className="mt-1 line-clamp-2 text-sm">
                          {ticket.message}
                        </CardDescription>
                        <p className="mt-2 text-xs text-slate-400">
                          {new Date(ticket.created_at).toLocaleDateString()} ·{" "}
                          {ticket.replies?.length || 0} replies
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Ticket detail / conversation thread */}
        <div className="space-y-4">
          {selectedTicket ? (
            <>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-slate-900">
                    #{selectedTicket.id} - {selectedTicket.subject}
                  </h2>
                  <Badge className={statusConfig[selectedTicket.status]?.color}>
                    {statusConfig[selectedTicket.status]?.label}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Created {new Date(selectedTicket.created_at).toLocaleString()}
                </p>
              </div>

              {/* Conversation thread */}
              <div className="space-y-3">
                {/* Original message */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">You</span>
                    <span className="text-xs text-slate-400">
                      {new Date(selectedTicket.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-900 whitespace-pre-wrap">
                    {selectedTicket.message}
                  </p>
                </div>

                {/* Replies */}
                {selectedTicket.replies?.map((reply) => (
                  <div
                    key={reply.id}
                    className={`rounded-xl border p-4 ${
                      reply.is_admin_reply
                        ? "border-blue-200 bg-blue-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700">
                        {reply.author_name}
                      </span>
                      {reply.is_admin_reply && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                          SUPPORT
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {new Date(reply.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-900 whitespace-pre-wrap">
                      {reply.message}
                    </p>
                  </div>
                ))}
              </div>

              {/* Reply box */}
              {selectedTicket.status !== "CLOSED" && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Add a Reply
                  </label>
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    rows={3}
                    className="mb-3"
                  />
                  <Button
                    onClick={handleReply}
                    disabled={!replyText.trim() || replying}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {replying ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Send Reply
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center shadow-sm">
              <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 text-slate-500">Select a ticket to view the conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
