import { useState } from "react"
import { Link, NavLink } from "react-router-dom"
import { ArrowRight, Building2, Menu, ShieldCheck, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { navLinks, serviceItems } from "@/components/shared/siteData"

function Logo() {
  return (
    <Link to="/" className="flex min-w-max items-center gap-3" aria-label="Westlakes Bank home">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#0A3D91] text-white shadow-lg shadow-[#0A3D91]/20">
        <Building2 className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block text-base font-semibold tracking-tight text-[#0F172A]">Westlakes Bank</span>
        <span className="block text-xs font-medium uppercase tracking-[0.22em] text-slate-500">Private digital banking</span>
      </span>
    </Link>
  )
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center lg:flex" aria-label="Main navigation">
          <NavigationMenu>
            <NavigationMenuList>
              {navLinks.map((item) =>
                item.label === "Services" ? (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuTrigger>Services</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid w-[680px] grid-cols-[0.9fr_1.1fr] gap-3 p-3">
                        <Link
                          to="/services"
                          className="flex min-h-64 flex-col justify-end rounded-2xl bg-[#0A3D91] p-6 text-white shadow-lg shadow-[#0A3D91]/20"
                        >
                          <ShieldCheck className="mb-8 size-9 text-[#D4AF37]" />
                          <p className="text-lg font-semibold">Banking for every chapter</p>
                          <p className="mt-3 text-sm leading-6 text-blue-100">
                            Accounts, lending, savings, and investment support with premium digital access.
                          </p>
                        </Link>
                        <div className="grid gap-2">
                          {serviceItems.map((service) => {
                            const Icon = service.icon
                            return (
                              <NavigationMenuLink asChild key={service.title}>
                                <Link to="/services" className="flex items-start gap-3 rounded-xl p-3 hover:bg-[#F8FAFC]">
                                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1E5EFF]/10 text-[#0A3D91]">
                                    <Icon className="size-5" />
                                  </span>
                                  <span>
                                    <span className="block text-sm font-semibold text-[#0F172A]">{service.title}</span>
                                    <span className="mt-1 block text-sm leading-5 text-slate-500">{service.description}</span>
                                  </span>
                                </Link>
                              </NavigationMenuLink>
                            )
                          })}
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ) : (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuLink asChild>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          isActive
                            ? "px-4 py-2 text-sm font-semibold text-[#0A3D91]"
                            : "px-4 py-2 text-sm font-medium text-slate-700 transition hover:text-[#0A3D91]"
                        }
                      >
                        {item.label}
                      </NavLink>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="ghost" asChild className="h-11 rounded-full px-5 text-[#0A3D91] hover:bg-[#F8FAFC]">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild className="h-11 rounded-full bg-[#0A3D91] px-5 text-white shadow-lg shadow-[#0A3D91]/20 hover:bg-[#1E5EFF]">
            <Link to="/register">
              Open Account
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-[#0A3D91] shadow-sm lg:hidden"
          onClick={() => setMobileOpen((value) => !value)}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 py-5 shadow-xl shadow-slate-950/5 lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-2" aria-label="Mobile navigation">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-sm font-semibold text-slate-700 transition hover:text-[#0A3D91]"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
              <Button variant="outline" asChild className="h-11 rounded-full border-slate-200">
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  Login
                </Link>
              </Button>
              <Button asChild className="h-11 rounded-full bg-[#0A3D91] text-white hover:bg-[#1E5EFF]">
                <Link to="/register" onClick={() => setMobileOpen(false)}>
                  Open Account
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
