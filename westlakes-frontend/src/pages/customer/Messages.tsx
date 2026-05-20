import { useEffect, useState, useCallback, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { Loader2, Send, Mail, MailOpen, Clock } from "lucide-react"

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

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showCompose, setShowCompose] = useState(false)
  const [composeSubject, setComposeSubject] = useState("")
  const [composeBody, setComposeBody] = useState("")
  const [composeType, setComposeType] = useState("DIRECT")
  const [sending, setSending] = useState(false)
  const [adminId, setAdminId] = useState<number | null>(null)

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await api.get<{ id: number; full_name: string; email: string }>("/api/auth/messaging/admin/")
        setAdminId(res.data.id)
      } catch {
        // silent — admin lookup is best-effort
      }
    }
    fetchAdmin()
  }, [])

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get<Message[]>("/api/messages/")
      setMessages(Array.isArray(response.data) ? response.data : [])
    } catch {
      setError("Unable to load messages.")
    } finally {
      setLoading(false)
    }
  }, [])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])
  /* eslint-enable react-hooks/set-state-in-effect */

  const openMessage = async (msg: Message) => {
    setSelectedMessage(msg)
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

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!composeBody.trim()) return
    if (!adminId) {
      setError("Unable to find an admin to send the message to. Please try again later.")
      return
    }
    setSending(true)
    try {
      await api.post("/api/messages/", {
        recipient: adminId,
        message_type: composeType,
        subject: composeSubject,
        body: composeBody,
      })
      setShowCompose(false)
      setComposeSubject("")
      setComposeBody("")
      setComposeType("DIRECT")
      fetchMessages()
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to send message.")
    } finally {
      setSending(false)
    }
  }

  const unreadCount = messages.filter((m) => !m.is_read).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Messages</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">Your Messages</h1>
          <p className="mt-1 text-slate-600">
            {unreadCount > 0
              ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        <Button
          className="rounded-full bg-slate-950 px-6 py-3 text-white hover:bg-slate-800"
          onClick={() => setShowCompose(!showCompose)}
        >
          <Send className="mr-2 h-4 w-4" />
          New Message
        </Button>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {/* Compose form */}
      {showCompose && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Send a Message to Support</h2>
          <form className="mt-4 space-y-4" onSubmit={handleSend}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Message Type</label>
              <select
                value={composeType}
                onChange={(e) => setComposeType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm"
              >
                <option value="DIRECT">Direct Message</option>
                <option value="INFO">Information</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Subject</label>
              <Input
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="Message subject..."
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Message</label>
              <Textarea
                rows={4}
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="Type your message to support..."
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={sending || !composeBody.trim()} className="bg-slate-950 hover:bg-slate-800">
                {sending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send Message
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCompose(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        {/* Message list */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : messages.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
              <Mail className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 text-slate-500">No messages yet</p>
              <p className="mt-1 text-sm text-slate-400">Messages from support will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => {
                const type = typeConfig[msg.message_type] || typeConfig.DIRECT
                return (
                  <Card
                    key={msg.id}
                    className={`cursor-pointer transition hover:shadow-md ${
                      selectedMessage?.id === msg.id ? "ring-2 ring-blue-500" : ""
                    } ${!msg.is_read ? "border-blue-200 bg-blue-50/30" : ""}`}
                    onClick={() => openMessage(msg)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {!msg.is_read && <Mail className="h-4 w-4 text-blue-600 shrink-0" />}
                            {msg.is_read && <MailOpen className="h-4 w-4 text-slate-400 shrink-0" />}
                            <Badge className={type.color}>{type.label}</Badge>
                            <p className="text-xs text-slate-500">
                              From: <span className="font-medium text-slate-700">{msg.sender_name}</span>
                            </p>
                          </div>
                          <CardTitle className="mt-1.5 text-base">{msg.subject || "(No subject)"}</CardTitle>
                          <CardDescription className="mt-1 line-clamp-2 text-sm">
                            {msg.body}
                          </CardDescription>
                          <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(msg.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Message detail */}
        <div>
          {selectedMessage ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {selectedMessage.subject || "(No subject)"}
                  </h2>
                  <Badge className={typeConfig[selectedMessage.message_type]?.color}>
                    {typeConfig[selectedMessage.message_type]?.label}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center gap-3 text-sm text-slate-500">
                  <span>From: <span className="font-medium text-slate-700">{selectedMessage.sender_name}</span></span>
                  <span>·</span>
                  <span>{new Date(selectedMessage.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-900 whitespace-pre-wrap">{selectedMessage.body}</p>
              </div>

              {/* Reply box */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <label className="mb-2 block text-sm font-medium text-slate-700">Reply</label>
                <Textarea
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Type your reply..."
                  rows={3}
                  className="mb-3"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      if (!composeBody.trim() || !selectedMessage) return
                      setSending(true)
                      try {
                        await api.post("/api/messages/", {
                          recipient: selectedMessage.sender,
                          message_type: "DIRECT",
                          subject: selectedMessage.subject ? `Re: ${selectedMessage.subject}` : "",
                          body: composeBody,
                        })
                        setComposeBody("")
                        fetchMessages()
                      } catch (err: any) {
                        setError(err?.response?.data?.error || "Failed to send reply.")
                      } finally {
                        setSending(false)
                      }
                    }}
                    disabled={!composeBody.trim() || sending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {sending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Send Reply
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center shadow-sm">
              <Mail className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 text-slate-500">Select a message to read it</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
