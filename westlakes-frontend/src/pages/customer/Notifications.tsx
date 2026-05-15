import { Card, CardContent } from "@/components/ui/card"

const notifications = [
  { message: "Your password was changed successfully.", time: "1 hour ago" },
  { message: "New login from a trusted device.", time: "Yesterday" },
  { message: "Card payment of £60 approved.", time: "May 14" },
]

export default function Notifications() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Notifications</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Recent alerts</h1>
      </div>
      <div className="grid gap-4">
        {notifications.map((item) => (
          <Card key={item.message} className="rounded-[1.75rem] border-slate-200">
            <CardContent className="flex items-center justify-between gap-4">
              <p className="text-slate-700">{item.message}</p>
              <span className="rounded-2xl bg-slate-100 px-3 py-1 text-sm text-slate-600">{item.time}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
