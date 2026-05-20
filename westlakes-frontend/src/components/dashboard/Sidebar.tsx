import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import { type LucideIcon, LogOut } from "lucide-react"

interface DashboardSidebarItem {
  label: string
  to: string
  icon: LucideIcon
}

interface DashboardSidebarProps {
  items: DashboardSidebarItem[]
  userName: string
  roleLabel: string
  onLogout: () => void
  isMobile?: boolean
}

export function DashboardSidebar({ items, userName, roleLabel, onLogout, isMobile = false }: DashboardSidebarProps) {
  return (
    <aside
      className={cn(
        "flex w-full flex-col overflow-hidden bg-[#0B1B34] p-2 text-white",
        isMobile ? "h-full rounded-[2rem] shadow-2xl shadow-slate-950/20" : "h-screen"
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-xl bg-[#0A3D91]">
          <span className="text-[10px] font-semibold text-white">W</span>
        </div>
        <div>
          <p className="text-[9px] font-semibold text-white">Westlakes Bank</p>
          <p className="text-[7px] uppercase tracking-[0.25em] text-slate-400">Dashboard</p>
        </div>
      </div>

      <div className="mb-2 rounded-lg border border-white/10 bg-white/5 p-1.5">
        <p className="text-[7px] uppercase tracking-[0.25em] text-slate-400">{roleLabel}</p>
        <p className="mt-0.5 text-[10px] font-semibold text-white truncate">{userName}</p>
      </div>

      <nav className="space-y-0.5 flex-1 overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[11px] font-medium transition",
                isActive
                  ? "bg-white text-[#0B1B34]"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              )
            }
          >
            <span className="grid h-5 w-5 place-items-center rounded-lg bg-white/10 text-[#7C98C5] transition group-hover:bg-white/15 group-hover:text-white">
              <item.icon className="size-2.5" />
            </span>
            <span className="text-[11px]">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-1.5 border-t border-white/10">
        <button
          type="button"
          onClick={onLogout}
          className="group inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-1.5 py-1 text-[11px] font-medium text-slate-100 transition hover:bg-white/10"
        >
          <LogOut className="size-3 text-[#D4AF37] transition group-hover:text-white" />
          Logout
        </button>
      </div>
    </aside>
  )
}
