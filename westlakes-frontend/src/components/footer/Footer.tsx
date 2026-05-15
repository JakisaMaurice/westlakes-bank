import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin } from "lucide-react"

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Careers", href: "/careers" },
  { label: "FAQ", href: "/faq" },
]

const serviceLinks = [
  { label: "Savings", href: "/services" },
  { label: "Loans", href: "/services" },
  { label: "Business Banking", href: "/services" },
  { label: "Investments", href: "/services" },
]

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-slate-950 text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:px-8 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-amber-300">Westlakes Bank</p>
          <p className="max-w-sm text-sm leading-7 text-slate-300">
            Westlakes Bank powers premium banking with a modern, secure digital experience for customers and businesses across the region.
          </p>
          <div className="mt-6 space-y-3 text-sm text-slate-400">
            <p className="flex items-center gap-2">
              <MapPin className="size-4 text-amber-300" />
              1200 Lakeshore Drive, Suite 500, London
            </p>
            <p className="flex items-center gap-2">
              <Mail className="size-4 text-amber-300" />
              support@westlakesbank.com
            </p>
            <p className="flex items-center gap-2">
              <Phone className="size-4 text-amber-300" />
              +44 20 7946 6800
            </p>
          </div>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-slate-200">Quick links</p>
          <div className="flex flex-col gap-3 text-sm text-slate-400">
            {quickLinks.map((link) => (
              <Link key={link.label} to={link.href} className="transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-slate-200">Services</p>
          <div className="flex flex-col gap-3 text-sm text-slate-400">
            {serviceLinks.map((link) => (
              <Link key={link.label} to={link.href} className="transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-slate-200">Newsletter</p>
          <p className="mb-4 text-sm leading-7 text-slate-400">
            Join our mailing list for banking insights, product launches, and market updates.
          </p>
          <form className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email address"
              aria-label="Email address"
              className="h-11 rounded-2xl border border-slate-700 bg-slate-900/80 px-4 text-sm text-slate-100 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20"
            />
            <Button type="submit" className="w-full justify-center bg-amber-400 text-slate-950 hover:bg-amber-300">
              Subscribe
            </Button>
          </form>
        </div>
      </div>

      <div className="border-t border-slate-800/80 bg-slate-900 px-4 py-6 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Westlakes Bank. All rights reserved.</p>
          <p>Designed for modern banking confidence and clarity.</p>
        </div>
      </div>
    </footer>
  )
}
