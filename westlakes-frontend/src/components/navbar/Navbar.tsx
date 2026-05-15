import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ChevronDown, Menu, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth"

const productLinks = [
  { label: "Personal Banking", href: "/services" },
  { label: "Business Banking", href: "/services" },
  { label: "Loans & Credit", href: "/services" },
  { label: "Investments", href: "/services" },
]

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Services", href: "/services", dropdown: true },
  { label: "Contact", href: "/contact" },
  { label: "Careers", href: "/careers" },
  { label: "FAQ", href: "/faq" },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  function handleSignOut() {
    logout()
    navigate("/login")
  }

  const dashboardPath = user?.role === "ADMIN" ? "/admin" : "/customer"

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 text-slate-900">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
            W
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em]">Westlakes Bank</p>
            <p className="text-xs text-slate-500">Trusted wealth partner</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((item) =>
            item.dropdown ? (
              <DropdownMenu key={item.label}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-10 gap-1 px-3 text-slate-700">
                    <span>{item.label}</span>
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {productLinks.map((link) => (
                    <DropdownMenuItem key={link.label} asChild>
                      <Link to={link.href}>{link.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={item.label}
                to={item.href}
                className="text-sm font-medium text-slate-700 transition hover:text-slate-900"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <span className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-700">
                {user.full_name}
              </span>
              <Button variant="ghost" size="sm" asChild>
                <Link to={dashboardPath}>Dashboard</Link>
              </Button>
              <Button size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Open Account</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:text-slate-900 lg:hidden"
          onClick={() => setMobileOpen((value) => !value)}
          aria-label="Toggle mobile menu"
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white/95 px-4 pb-6 pt-3 lg:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {user ? (
              <>
                <Button variant="outline" size="default" onClick={() => { handleSignOut(); setMobileOpen(false) }}>
                  Sign out
                </Button>
                <Button size="default" asChild>
                  <Link to={dashboardPath} onClick={() => setMobileOpen(false)}>
                    Dashboard
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="default" asChild>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button size="default" asChild>
                  <Link to="/register" onClick={() => setMobileOpen(false)}>
                    Open Account
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
