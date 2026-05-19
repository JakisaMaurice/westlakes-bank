import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Bell, CheckCircle2, MessageSquare } from "lucide-react"

interface NotificationItem {
  id: string
  title: string
  detail: string
  time: string
  icon: "bell" | "check" | "message"
}

const iconMap = {
  bell: Bell,
  check: CheckCircle2,
  message: MessageSquare,
}

interface NotificationPanelProps {
  items: NotificationItem[]
}

export function NotificationPanel({ items }: NotificationPanelProps) {
  return (
    <Card className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-950/5">
      <CardContent className="space-y-5">
        <div>
          <CardTitle className="text-xl font-semibold text-[#0F172A]">Notifications</CardTitle>
          <CardDescription className="text-sm text-slate-500">Your most recent alerts and service notes.</CardDescription>
        </div>
        <div className="space-y-4">
          {items.map((notification) => {
            const Icon = iconMap[notification.icon]
            return (
              <div key={notification.id} className="flex items-center gap-4 rounded-[1.75rem] border border-slate-200 bg-[#F8FAFC] p-4">
                <span className="grid h-12 w-12 place-items-center rounded-3xl bg-[#0A3D91] text-white">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#1E293B]">{notification.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{notification.detail}</p>
                </div>
                <span className="text-sm text-slate-400">{notification.time}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
