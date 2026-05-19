import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import { Loader2, MessageSquare, XCircle, CheckCircle, Clock, AlertCircle } from "lucide-react"

interface TicketItem {
  id: number
  customer: number
  customer_name: string
  subject: string
  message: string
  status: string
  admin_response: string
  created_at: string
  updated_at: string
}

const statusConfig: Record<string, { color: string; label: string; icon: typeof Clock }> = {
  OPEN: { color: "bg-amber-100 text-amber-700", label: "Open", icon: AlertCircle },
  IN_PROGRESS: { color: "bg-blue-100 text-blue-700", label: "In Progress", icon: Clock },
  RESOLVED: { color: "bg-green-100 text-green-700", label: "Resolved", icon: CheckCircle },
  CLOSED: { color: "bg-slate-100 text-slate-700", label: "Closed", icon: XCircle },
}

export default function TicketManagement() {
  const [tickets, setTickets] = useState<TicketItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showRespondModal, setShowRespondModal] = useState(false)
  const [responseText, setResponseText] = useState("")
  const [processing, setProcessing] = useState(false)

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get<TicketItem[]>("/api/tickets/")
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

  const openDetail = async (ticket: TicketItem) => {
    try {
      const response = await api.get<TicketItem>(`/api/tickets/${ticket.id}/`)
      setSelectedTicket(response.data)
      setShowDetailModal(true)
    } catch {
      setError("Failed to load ticket details.")
    }
  }

  const handleRespond = async () => {
    if (!selectedTicket || !responseText.trim()) return
    setProcessing(true)
    try {
      await api.post(`/api/tickets/${selectedTicket.id}/respond/`, {
        response: responseText,
      })
      setShowRespondModal(false)
      setResponseText("")
      setShowDetailModal(false)
      fetchTickets()
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to respond to ticket.")
    } finally {
      setProcessing(false)
    }
  }

  const handleClose = async (ticketId: number) => {
    try {
      await api.post(`/api/tickets/${ticketId}/close/`)
      setShowDetailModal(false)
      fetchTickets()
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to close ticket.")
    }
  }

  const openRespondModal = (ticket: TicketItem) => {
    setSelectedTicket(ticket)
    setResponseText("")
    setShowRespondModal(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Support</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Ticket Management</h1>
        <p className="mt-1 text-slate-600">Respond to and resolve customer support requests</p>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-3 text-slate-500">No tickets found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Ticket
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tickets.map((ticket) => {
                const status = statusConfig[ticket.status] || statusConfig.OPEN
                return (
                  <tr key={ticket.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">#{ticket.id} - {ticket.subject}</p>
                      <p className="mt-0.5 text-sm text-slate-500 line-clamp-1">{ticket.message}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900">{ticket.customer_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={status.color}>{status.label}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDetail(ticket)}
                        >
                          View
                        </Button>
                        {ticket.status !== "CLOSED" && (
                          <Button
                            size="sm"
                            onClick={() => openRespondModal(ticket)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <MessageSquare className="mr-1 h-3.5 w-3.5" />
                            Respond
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Ticket #{selectedTicket?.id} - {selectedTicket?.subject}
            </DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={statusConfig[selectedTicket.status]?.color}>
                  {statusConfig[selectedTicket.status]?.label}
                </Badge>
                <span className="text-sm text-slate-500">
                  by {selectedTicket.customer_name} on {new Date(selectedTicket.created_at).toLocaleString()}
                </span>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-700">Customer Message</p>
                <p className="mt-2 text-sm text-slate-900 whitespace-pre-wrap">{selectedTicket.message}</p>
              </div>

              {selectedTicket.admin_response && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm font-medium text-blue-700">Admin Response</p>
                  <p className="mt-2 text-sm text-blue-900 whitespace-pre-wrap">{selectedTicket.admin_response}</p>
                </div>
              )}

              {selectedTicket.status !== "CLOSED" && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => openRespondModal(selectedTicket)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Respond
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleClose(selectedTicket.id)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Close Ticket
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Respond Modal */}
      <Dialog open={showRespondModal} onOpenChange={setShowRespondModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Ticket #{selectedTicket?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-medium text-slate-700">{selectedTicket?.subject}</p>
              <p className="mt-1 text-sm text-slate-600 line-clamp-2">{selectedTicket?.message}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Your Response
              </label>
              <Textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Type your response to the customer..."
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRespondModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRespond}
              disabled={!responseText.trim() || processing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {processing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MessageSquare className="mr-2 h-4 w-4" />
              )}
              Send Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
