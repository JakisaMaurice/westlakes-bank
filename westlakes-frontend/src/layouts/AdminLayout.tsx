import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "@/lib/useAuth"

const adminNav = [
  { label: "Admin Dashboard", to: "" },
  { label: "Customer Management", to: "customers" },
  { label: "Account Approvals", to: "approvals" },
  { label: "Transaction Monitoring", to: "transactions" },
  { label: "Ticket Management", to: "tickets" },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleSignOut() {
    logout()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900/95 py-5 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Admin Dashboard</p>
            <h1 className="text-2xl font-semibold text-white">Westlakes Bank</h1>
            {user ? (
              <p className="text-sm text-slate-400">Signed in as {user.full_name}</p>
            ) : null}
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/40 hover:bg-slate-700"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className="rounded-[2rem] border border-slate-800 bg-slate-900/95 p-6 shadow-2xl shadow-slate-950/20">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Menu</p>
          </div>
          <nav className="space-y-2">
            {adminNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-800 text-white shadow-lg shadow-cyan-500/10"
                      : "text-slate-300 hover:bg-slate-950/80 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="rounded-[2rem] bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/40 ring-1 ring-white/5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
