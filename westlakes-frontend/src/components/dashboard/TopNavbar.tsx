import { Bell, Sparkles, UserCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TopNavbarProps {
  title: string
  subtitle: string
}

export function TopNavbar({ title, subtitle }: TopNavbarProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-xl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E6EEFF] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.32em] text-[#0A3D91]">
            <Sparkles className="size-3 text-[#0A3D91]" /> Trusted banking
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-slate-500">{subtitle}</p>
            <h1 className="mt-0.5 text-sm font-bold tracking-tight text-[#1E293B]">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-full border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 hover:bg-slate-50">
            <Bell className="size-3.5" />
          </Button>
          <button className="grid h-8 w-8 place-items-center rounded-full bg-[#0A3D91] text-white shadow-sm">
            <UserCircle2 className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
