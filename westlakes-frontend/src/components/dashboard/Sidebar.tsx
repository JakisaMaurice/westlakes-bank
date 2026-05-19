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
        "flex w-full flex-col overflow-hidden bg-[#0B1B34] p-3 text-white",
        isMobile ? "h-full rounded-[2rem] shadow-2xl shadow-slate-950/20" : "h-screen"
      )}
    >
      <div className="mb-5 flex items-center gap-2.5">
        <div className="grid h-9 w-9 place-items-center rounded-3xl bg-[#0A3D91]">
          <span className="text-sm font-semibold text-white">W</span>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-white">Westlakes Bank</p>
          <p className="text-[9px] uppercase tracking-[0.3em] text-slate-400">Dashboard</p>
        </div>
      </div>

      <div className="mb-5 rounded-[1.5rem] border border-white/10 bg-white/5 p-2.5">
        <p className="text-[9px] uppercase tracking-[0.3em] text-slate-400">{roleLabel}</p>
        <p className="mt-1.5 text-sm font-semibold text-white">{userName}</p>
        <p className="mt-1 text-[10px] text-slate-400">Secure access · 2h ago</p>
      </div>

      <nav className="space-y-1.5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-white text-[#0B1B34]"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              )
            }
          >
            <span className="grid h-8 w-8 place-items-center rounded-2xl bg-white/10 text-[#7C98C5] transition group-hover:bg-white/15 group-hover:text-white">
              <item.icon className="size-3" />
            </span>
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-3.5 border-t border-white/10">
        <button
          type="button"
          onClick={onLogout}
          className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-2.5 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
        >
          <LogOut className="size-4 text-[#D4AF37] transition group-hover:text-white" />
          Logout
        </button>
      </div>
    </aside>
  )
}
