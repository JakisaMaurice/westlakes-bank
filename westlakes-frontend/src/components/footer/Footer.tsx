import { Link } from "react-router-dom"
import { ArrowUpRight, Building2, Mail, MapPin, Phone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { brand, footerServiceLinks, navLinks } from "@/components/shared/siteData"

export default function Footer() {
  return (
    <footer className="bg-[#061B3A] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1fr] lg:px-8">
        <div>
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#0A3D91]">
              <Building2 className="size-5" />
            </span>
            <span>
              <span className="block text-lg font-semibold">{brand.name}</span>
              <span className="block text-xs uppercase tracking-[0.22em] text-blue-100">Private digital banking</span>
            </span>
          </Link>
          <p className="mt-6 max-w-sm text-sm leading-7 text-blue-100">
            Premium public banking experiences for people and companies who want clarity, security, and modern financial access.
          </p>
          <div className="mt-7 space-y-3 text-sm text-blue-100">
            <p className="flex items-center gap-3">
              <MapPin className="size-4 text-[#D4AF37]" />
              {brand.address}
            </p>
            <p className="flex items-center gap-3">
              <Mail className="size-4 text-[#D4AF37]" />
              {brand.email}
            </p>
            <p className="flex items-center gap-3">
              <Phone className="size-4 text-[#D4AF37]" />
              {brand.phone}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#D4AF37]">Company</p>
          <div className="mt-5 flex flex-col gap-3 text-sm text-blue-100">
            {navLinks.map((link) => (
              <Link key={link.label} to={link.href} className="transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#D4AF37]">Services</p>
          <div className="mt-5 flex flex-col gap-3 text-sm text-blue-100">
            {footerServiceLinks.map((link) => (
              <Link key={link.label} to={link.href} className="transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#D4AF37]">Start here</p>
          <p className="mt-4 text-sm leading-7 text-blue-100">
            Explore account options or speak with a Westlakes specialist about the right next step.
          </p>
          <div className="mt-5 grid gap-3">
            <Button asChild className="h-11 rounded-full bg-[#D4AF37] text-[#0F172A] hover:bg-[#e6c65a]">
              <Link to="/register">
                Open Account
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-11 rounded-full border-white/20 bg-transparent text-white hover:bg-white/10">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-sm text-blue-100">
          <p>© 2026 Westlakes Bank. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
