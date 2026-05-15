import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "@/lib/auth"

const navItems = [
  { label: "Dashboard", to: "" },
  { label: "Accounts", to: "accounts" },
  { label: "Transactions", to: "transactions" },
  { label: "Transfers", to: "transfers" },
  { label: "Tickets", to: "tickets" },
  { label: "Notifications", to: "notifications" },
  { label: "Profile", to: "profile" },
]

export default function CustomerLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleSignOut() {
    logout()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-500">Customer Portal</p>
            <h1 className="text-2xl font-semibold text-slate-950">Westlakes Bank</h1>
            {user ? (
              <p className="text-sm text-slate-600">Welcome, {user.full_name}</p>
            ) : null}
          </div>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Navigation</p>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="rounded-[2rem] bg-white p-8 shadow-sm">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
