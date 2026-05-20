import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { Bell, Check, CheckCheck, Loader2 } from "lucide-react"

interface Notification {
  id: number
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

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await api.get<Notification[]>("/api/notifications/")
      setNotifications(response.data.slice(0, 10))
      setUnreadCount(response.data.filter((n) => !n.read_status).length)
    } catch (err) {
      console.error("Failed to fetch notifications:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const markAsRead = async (id: number) => {
    try {
      await api.post(`/api/notifications/${id}/read/`)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_status: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error("Failed to mark notification as read:", err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.post("/api/notifications/mark-all-read/")
      setNotifications((prev) => prev.map((n) => ({ ...n, read_status: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err)
    }
  }

  const formatTime = (dateString: string) => {
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
    return date.toLocaleDateString()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg sm:w-96">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h3 className="font-semibold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                <CheckCheck className="mr-1 h-3 w-3" />
                Mark all read
              </Button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex gap-3 px-4 py-3 hover:bg-slate-50 ${
                      !notification.read_status ? "bg-blue-50/50" : ""
                    }`}
                  >
                    <span className="text-lg">
                      {notificationIcons[notification.notification_type] || "📢"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm ${
                            !notification.read_status
                              ? "font-semibold text-slate-900"
                              : "font-medium text-slate-700"
                          }`}
                        >
                          {notification.title}
                        </p>
                        {!notification.read_status && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-slate-400 hover:text-blue-600"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-slate-500 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-slate-200 px-4 py-2">
              <Button
                variant="ghost"
                className="w-full text-sm text-blue-600 hover:text-blue-700"
                onClick={() => {
                  setIsOpen(false)
                  window.location.href = "/dashboard/notifications"
                }}
              >
                View all notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}