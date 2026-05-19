import { Outlet, useNavigate } from "react-router-dom"
import { Home, Wallet, TrendingUp, ArrowRightCircle, MessageSquare, Bell, User, Menu } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard/Sidebar"
import { TopNavbar } from "@/components/dashboard/TopNavbar"

const customerNav = [
  { label: "Dashboard Overview", to: "", icon: Home },
  { label: "Accounts", to: "accounts", icon: Wallet },
  { label: "Transactions", to: "transactions", icon: TrendingUp },
  { label: "Transfers", to: "transfers", icon: ArrowRightCircle },
  { label: "Support Tickets", to: "tickets", icon: MessageSquare },
  { label: "Notifications", to: "notifications", icon: Bell },
  { label: "Profile", to: "profile", icon: User },
]

export default function CustomerDashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1E293B]">
      <div className="hidden lg:block">
        <div className="fixed left-0 top-0 h-screen w-64 border-r border-slate-200/10 bg-transparent">
          <DashboardSidebar items={customerNav} userName={user?.full_name ?? "Customer"} roleLabel="Customer portal" onLogout={handleLogout} />
        </div>
      </div>

      <div className="lg:hidden border-b border-slate-200 bg-white/95 px-5 py-3 shadow-sm backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:bg-slate-50">
                <Menu className="size-4" />
              </button>
            </DialogTrigger>
            <DialogContent className="!top-0 !left-0 !translate-x-0 !-translate-y-0 fixed inset-y-0 left-0 z-50 w-full max-w-xs rounded-r-[2rem] bg-transparent p-0 shadow-2xl">
              <DashboardSidebar items={customerNav} userName={user?.full_name ?? "Customer"} roleLabel="Customer portal" onLogout={handleLogout} isMobile />
            </DialogContent>
          </Dialog>

          <div>
            <p className="text-[9px] uppercase tracking-[0.35em] text-[#0A3D91]">Westlakes Bank</p>
            <h2 className="text-base font-bold text-[#0F172A]">Customer dashboard</h2>
          </div>

          <button onClick={handleLogout} className="rounded-xl bg-[#0A3D91] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#1E5EFF]">
            Logout
          </button>
        </div>
      </div>

      <main className="lg:ml-64 min-h-screen overflow-y-auto px-5 py-4">
        <TopNavbar title="Customer dashboard" subtitle="Digital banking made premium." />
        <div className="mt-4">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
