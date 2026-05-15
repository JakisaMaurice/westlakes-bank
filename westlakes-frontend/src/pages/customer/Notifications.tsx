import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { api } from "@/lib/api"

interface Notification {
  id: number
  title: string
  message: string
  read_status: boolean
  created_at: string
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadNotifications = () => {
    setLoading(true)
    void api
      .get<Notification[]>("/api/notifications/")
      .then((response) => setNotifications(response.data))
      .catch(() => setError("Unable to load notifications."))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const markAllRead = async () => {
    try {
      await api.post("/api/notifications/mark-all-read/")
      setNotifications((current) => current.map((item) => ({ ...item, read_status: true })))
    } catch {
      setError("Unable to mark notifications as read.")
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Notifications</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">Recent alerts</h1>
        </div>
        <Button className="rounded-full bg-slate-950 px-6 py-3 text-white hover:bg-slate-800" onClick={markAllRead}>
          Mark all read
        </Button>
      </div>

      {loading ? (
        <p className="text-slate-600">Loading notifications...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="grid gap-4">
          {notifications.map((item) => (
            <Card key={item.id} className="rounded-[1.75rem] border-slate-200">
              <CardContent className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-950">{item.title}</p>
                  <p className="text-slate-700">{item.message}</p>
                </div>
                <span className={`rounded-2xl px-3 py-1 text-sm ${item.read_status ? "bg-slate-100 text-slate-600" : "bg-amber-100 text-amber-700"}`}>
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
