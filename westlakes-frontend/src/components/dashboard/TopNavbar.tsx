import { useState, useRef, useEffect } from "react"
import { Bell, Sparkles, Settings, Shield, BellRing, KeyRound, LogOut, User, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/lib/useAuth"

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

interface TopNavbarProps {
  title: string
  subtitle: string
  showProfile?: boolean
}

export function TopNavbar({ title, subtitle, showProfile = true }: TopNavbarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifLoading, setNotifLoading] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    setNotifLoading(true)
    try {
      const response = await api.get<Notification[]>("/api/notifications/")
      setNotifications(response.data.slice(0, 10))
      setUnreadCount(response.data.filter((n) => !n.read_status).length)
    } catch {
      // silent
    } finally {
      setNotifLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const markAsRead = async (id: number) => {
    try {
      await api.post(`/api/notifications/${id}/read/`)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_status: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {
      // silent
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.post("/api/notifications/mark-all-read/")
      setNotifications((prev) => prev.map((n) => ({ ...n, read_status: true })))
      setUnreadCount(0)
    } catch {
      // silent
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E6EEFF] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.32em] text-[#0A3D91]">
            <Sparkles className="size-3 text-[#0A3D91]" /> Trusted banking
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-slate-500 truncate">{subtitle}</p>
            <h1 className="mt-0.5 text-sm font-bold tracking-tight text-[#1E293B] truncate">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 hover:bg-slate-50"
              onClick={() => {
                setNotifOpen(!notifOpen)
                setProfileOpen(false)
              }}
            >
              <Bell className="size-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>

            {notifOpen && (
              <div className="absolute -right-2 top-full z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg sm:right-0 sm:w-96" style={{ backgroundColor: '#ffffff', isolation: 'isolate' }}>
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                  <h3 className="font-semibold text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifLoading && notifications.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-8 text-center text-sm text-slate-500">
                      No notifications
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`flex gap-3 px-4 py-3 hover:bg-slate-50 transition ${
                            !n.read_status ? "bg-blue-50/50" : ""
                          }`}
                        >
                          <span className="text-lg shrink-0">
                            {notificationIcons[n.notification_type] || "📢"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm truncate ${!n.read_status ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}>
                                {n.title}
                              </p>
                              {!n.read_status && (
                                <button
                                  onClick={() => markAsRead(n.id)}
                                  className="text-slate-400 hover:text-blue-600 shrink-0"
                                  title="Mark as read"
                                >
                                  <span className="text-xs">✓</span>
                                </button>
                              )}
                            </div>
                            <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{n.message}</p>
                            <p className="mt-1 text-[10px] text-slate-400">{formatTime(n.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 px-4 py-2">
                  <button
                    className="w-full text-sm text-blue-600 hover:text-blue-700 py-1"
                    onClick={() => {
                      setNotifOpen(false)
                      navigate("/dashboard/notifications")
                    }}
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          {showProfile && (
          <div className="relative" ref={profileRef}>
            <button
              className="flex items-center gap-1.5 rounded-full bg-[#0A3D91] px-1.5 py-1.5 text-white shadow-sm hover:bg-[#164BB5] transition"
              onClick={() => {
                setProfileOpen(!profileOpen)
                setNotifOpen(false)
              }}
            >
              <div className="grid h-6 w-6 place-items-center rounded-full bg-white/20 text-[10px] font-bold">
                {user ? getInitials(user.full_name) : "U"}
              </div>
              <ChevronDown className="size-3 mr-0.5" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg" style={{ backgroundColor: '#ffffff', isolation: 'isolate' }}>
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user?.full_name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  {[
                    { icon: User, label: "View Profile", to: "/dashboard/profile" },
                    { icon: Settings, label: "Settings", to: "/dashboard/profile" },
                    { icon: Shield, label: "Security", to: "/dashboard/profile" },
                    { icon: BellRing, label: "Notifications", to: "/dashboard/notifications" },
                    { icon: KeyRound, label: "Change Password", to: "/dashboard/profile" },
                  ].map((item) => (
                    <button
                      key={item.label}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                      onClick={() => {
                        setProfileOpen(false)
                        navigate(item.to)
                      }}
                    >
                      <item.icon className="h-4 w-4 text-slate-400" />
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="border-t border-slate-100 py-1">
                  <button
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  )
}
