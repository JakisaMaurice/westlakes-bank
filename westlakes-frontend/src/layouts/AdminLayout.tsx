import { NavLink, Outlet } from "react-router-dom"

const adminNav = [
  { label: "Admin Dashboard", to: "dashboard" },
  { label: "Customer Management", to: "customer-management" },
  { label: "Account Approvals", to: "account-approvals" },
  { label: "Transaction Monitoring", to: "transaction-monitoring" },
  { label: "Ticket Management", to: "ticket-management" },
  { label: "Reports", to: "reports" },
]

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Admin Dashboard</p>
            <h1 className="text-2xl font-semibold text-slate-950">Westlakes Bank</h1>
          </div>
          <button className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
            Sign out
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Menu</p>
          </div>
          <nav className="space-y-2">
            {adminNav.map((item) => (
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
