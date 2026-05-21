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
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { Loader2, Send, Mail, MailOpen, Clock, User, AlertCircle, AtSign } from "lucide-react"
import { toast } from "sonner"

interface Message {
  id: number
  sender: number
  sender_name: string
  recipient: number
  recipient_name: string
  message_type: string
  subject: string
  body: string
  is_read: boolean
  read_at: string | null
  created_at: string
}

const typeConfig: Record<string, { color: string; label: string }> = {
  DIRECT: { color: "bg-slate-100 text-slate-700", label: "Direct" },
  ANNOUNCEMENT: { color: "bg-blue-100 text-blue-700", label: "Announcement" },
  WARNING: { color: "bg-red-100 text-red-700", label: "Warning" },
  INFO: { color: "bg-emerald-100 text-emerald-700", label: "Info" },
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showReply, setShowReply] = useState(false)
  const [replyBody, setReplyBody] = useState("")
  const [replySubject, setReplySubject] = useState("")
  const [replyType, setReplyType] = useState("DIRECT")
  const [sending, setSending] = useState(false)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const [showExternalEmail, setShowExternalEmail] = useState(false)
  const [extEmail, setExtEmail] = useState("")
  const [extSubject, setExtSubject] = useState("")
  const [extBody, setExtBody] = useState("")
  const [extSending, setExtSending] = useState(false)
  const [extError, setExtError] = useState("")

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter === "unread") params.set("is_read", "false")
      const response = await api.get<Message[]>(`/api/messages/?${params.toString()}`)
      setMessages(Array.isArray(response.data) ? response.data : [])
    } catch {
      setError("Unable to load messages.")
    } finally {
      setLoading(false)
    }
  }, [filter])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])
  /* eslint-enable react-hooks/set-state-in-effect */

  const openMessage = async (msg: Message) => {
    setSelectedMessage(msg)
    setShowDetail(true)
    if (!msg.is_read) {
      try {
        await api.post(`/api/messages/${msg.id}/read/`)
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, is_read: true, read_at: new Date().toISOString() } : m))
        )
      } catch {
        // silent
      }
    }
  }

  const handleReply = async () => {
    if (!selectedMessage || !replyBody.trim()) return
    setSending(true)
    try {
      await api.post("/api/messages/", {
        recipient: selectedMessage.sender,
        message_type: replyType,
        subject: replySubject,
        body: replyBody,
      })
      setShowReply(false)
      setReplyBody("")
      setReplySubject("")
      setShowDetail(false)
      fetchMessages()
      toast.success("Reply sent successfully")
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to send reply.")
    } finally {
      setSending(false)
    }
  }

  const openExternalEmail = () => {
    setExtEmail("")
    setExtSubject("")
    setExtBody("")
    setExtError("")
    setShowExternalEmail(true)
  }

  const openExternalEmailTo = (email: string) => {
    setExtEmail(email)
    setExtSubject("")
    setExtBody("")
    setExtError("")
    setShowExternalEmail(true)
  }

  const handleSendExternalEmail = async () => {
    if (!extEmail.trim()) {
      setExtError("Email address is required")
      return
    }
    if (!extBody.trim()) {
      setExtError("Message body is required")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(extEmail.trim())) {
      setExtError("Please enter a valid email address")
      return
    }

    setExtSending(true)
    setExtError("")

    try {
      await api.post("/api/messages/send-external-email/", {
        recipient_email: extEmail.trim(),
        subject: extSubject,
        body: extBody,
      })
      setShowExternalEmail(false)
      toast.success("Email sent successfully", {
        description: `Message delivered to ${extEmail}`,
      })
    } catch (err: any) {
      setExtError(err?.response?.data?.error || "Failed to send email. Email service may not be configured.")
    } finally {
      setExtSending(false)
    }
  }

  const unreadCount = messages.filter((m) => !m.is_read).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Messages</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">Customer Messages</h1>
          <p className="mt-1 text-slate-600">
            {unreadCount > 0
              ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={openExternalEmail} className="bg-blue-600 hover:bg-blue-700">
            <AtSign className="mr-2 h-4 w-4" />
            Send External Email
          </Button>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as "all" | "unread")}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">All Messages</option>
            <option value="unread">Unread Only</option>
          </select>
        </div>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center">
          <Mail className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-3 text-slate-500">No messages found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Sender
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Recipient
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {messages.map((msg) => {
                const type = typeConfig[msg.message_type] || typeConfig.DIRECT
                return (
                  <tr
                    key={msg.id}
                    className={`hover:bg-slate-50 cursor-pointer ${!msg.is_read ? "bg-blue-50/30" : ""}`}
                    onClick={() => openMessage(msg)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {!msg.is_read && <Mail className="h-4 w-4 text-blue-600 shrink-0" />}
                        {msg.is_read && <MailOpen className="h-4 w-4 text-slate-400 shrink-0" />}
                        <div>
                          <p className={`text-sm ${!msg.is_read ? "font-semibold text-slate-900" : "text-slate-700"}`}>
                            {msg.subject || "(No subject)"}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-1">{msg.body}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900">{msg.sender_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900">{msg.recipient_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={type.color}>{type.label}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedMessage(msg)
                            setReplySubject(msg.subject ? `Re: ${msg.subject}` : "")
                            setReplyBody("")
                            setReplyType("DIRECT")
                            setShowReply(true)
                          }}
                        >
                          <Send className="mr-1 h-3.5 w-3.5" />
                          Reply
                        </Button>
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
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedMessage?.subject || "(No subject)"}
            </DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  From: <span className="font-medium text-slate-700">{selectedMessage.sender_name}</span>
                </span>
                <span>→</span>
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  To: <span className="font-medium text-slate-700">{selectedMessage.recipient_name}</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(selectedMessage.created_at).toLocaleString()}
                </span>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-900 whitespace-pre-wrap">{selectedMessage.body}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setReplySubject(selectedMessage.subject ? `Re: ${selectedMessage.subject}` : "")
                    setReplyBody("")
                    setReplyType("DIRECT")
                    setShowReply(true)
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Reply
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetail(false)
                    openExternalEmailTo(selectedMessage.sender_name)
                  }}
                >
                  <AtSign className="mr-2 h-4 w-4" />
                  Email Externally
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reply Modal */}
      <Dialog open={showReply} onOpenChange={setShowReply}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Reply to {selectedMessage?.sender_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <Input
                value={replySubject}
                onChange={(e) => setReplySubject(e.target.value)}
                placeholder="Message subject..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Message Type</label>
              <select
                value={replyType}
                onChange={(e) => setReplyType(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              >
                <option value="DIRECT">Direct Message</option>
                <option value="ANNOUNCEMENT">Announcement</option>
                <option value="WARNING">Warning</option>
                <option value="INFO">Information</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Your Response</label>
              <Textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Type your reply..."
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReply(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReply}
              disabled={!replyBody.trim() || sending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {sending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* External Email Modal */}
      <Dialog open={showExternalEmail} onOpenChange={setShowExternalEmail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send External Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
              <p className="text-sm text-blue-800">
                Send an email to any email address, even if they are not a registered user of Westlakes Bank.
                The email will be sent from the bank's admin account.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Recipient Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={extEmail}
                onChange={(e) => setExtEmail(e.target.value)}
                placeholder="e.g., john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <Input
                value={extSubject}
                onChange={(e) => setExtSubject(e.target.value)}
                placeholder="Email subject..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Message <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={extBody}
                onChange={(e) => setExtBody(e.target.value)}
                placeholder="Type your message..."
                rows={6}
              />
            </div>
            {extError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {extError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExternalEmail(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendExternalEmail}
              disabled={extSending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {extSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
