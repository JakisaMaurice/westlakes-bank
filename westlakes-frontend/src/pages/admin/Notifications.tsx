import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { Loader2, CheckCheck, Bell, User } from "lucide-react"

interface Notification {
  id: number
  user: number
  user_full_name?: string
  notification_type: string
  title: string
  message: string
  read_status: boolean
  created_at: string
}

const notificationIcons: Record<string, string> = {
  ACCOUNT_APPROVED: "✅",
  ACCOUNT_REJECTED: "❌",
  VERIFICATION_APPROVED: "✅",
  VERIFICATION_REJECTED: "❌",
  DEPOSIT: "💰",
  TRANSFER_SENT: "📤",
  TRANSFER_RECEIVED: "📥",
  ACCOUNT_SUSPENDED: "⚠️",
  ACCOUNT_FROZEN: "❄️",
  PASSWORD_RESET: "🔑",
  KYC_REMINDER: "📋",
  GENERAL: "📢",
}

const notificationColors: Record<string, string> = {
  ACCOUNT_APPROVED: "border-green-200 bg-green-50/50",
  VERIFICATION_APPROVED: "border-green-200 bg-green-50/50",
  DEPOSIT: "border-green-200 bg-green-50/50",
  TRANSFER_RECEIVED: "border-green-200 bg-green-50/50",
  ACCOUNT_REJECTED: "border-red-200 bg-red-50/50",
  VERIFICATION_REJECTED: "border-red-200 bg-red-50/50",
  ACCOUNT_SUSPENDED: "border-orange-200 bg-orange-50/50",
  ACCOUNT_FROZEN: "border-blue-200 bg-blue-50/50",
  TRANSFER_SENT: "border-slate-200 bg-slate-50/50",
  PASSWORD_RESET: "border-amber-200 bg-amber-50/50",
  KYC_REMINDER: "border-amber-200 bg-amber-50/50",
  GENERAL: "border-slate-200 bg-slate-50/50",
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams()
      if (filter === "unread") {
        params.set("read_status", "false")
      }
      const response = await api.get<Notification[]>(`/api/notifications/?${params.toString()}`)
      setNotifications(Array.isArray(response.data) ? response.data : [])
    } catch {
      setError("Unable to load notifications.")
    } finally {
      setLoading(false)
    }
  }, [filter])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])
  /* eslint-enable react-hooks/set-state-in-effect */

  const markAsRead = async (id: number) => {
    try {
      await api.post(`/api/notifications/${id}/read/`)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_status: true } : n)))
    } catch {
      // silent
    }
  }

  const markAllRead = async () => {
    try {
      await api.post("/api/notifications/mark-all-read/")
      setNotifications((current) => current.map((item) => ({ ...item, read_status: true })))
    } catch {
      setError("Unable to mark notifications as read.")
    }
  }

  const unreadCount = notifications.filter((n) => !n.read_status).length

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Notifications</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">System Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as "all" | "unread")}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
          </select>
          {unreadCount > 0 && (
            <Button className="rounded-full bg-slate-900 px-6 py-3 text-white hover:bg-slate-800" onClick={markAllRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600">{error}</p>
          <Button variant="outline" className="mt-3" onClick={fetchNotifications}>
            Retry
          </Button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <Bell className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-slate-500">No notifications found</p>
          <p className="mt-1 text-sm text-slate-400">Notifications from customers and system events will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => {
            const colorClass = notificationColors[item.notification_type] || "border-slate-200 bg-white"
            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-4 transition ${colorClass} ${
                  !item.read_status ? "ring-1 ring-blue-200" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0 mt-0.5">
                    {notificationIcons[item.notification_type] || "📢"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm ${!item.read_status ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}>
                          {item.title}
                        </p>
                        {item.user_full_name && (
                          <p className="mt-0.5 text-xs text-slate-500 flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {item.user_full_name}
                          </p>
                        )}
                      </div>
                      {!item.read_status && (
                        <button
                          onClick={() => markAsRead(item.id)}
                          className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-blue-600 transition"
                          title="Mark as read"
                        >
                          <CheckCheck className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{item.message}</p>
                    <p className="mt-2 text-xs text-slate-400">{formatDate(item.created_at)}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
