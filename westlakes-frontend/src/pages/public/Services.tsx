import { Link } from "react-router-dom"
import { ArrowRight, CheckCircle2 } from "lucide-react"

import SectionHeading from "@/components/shared/SectionHeading"
import { serviceItems, whyChooseItems } from "@/components/shared/siteData"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"

export default function Services() {
  return (
    <div>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="Services"
            title="Premium banking products for personal and business progress."
            description="Choose from connected accounts, loans, savings, investment support, and business tools designed with clarity from first touch."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {serviceItems.map((service) => {
            const Icon = service.icon
            return (
              <Card key={service.title} className="rounded-2xl border-slate-200 bg-white p-2 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D4AF37]">{service.eyebrow}</span>
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#1E5EFF]/10 text-[#0A3D91]">
                      <Icon className="size-5" />
                    </span>
                  </div>
                  <CardTitle className="mt-6 text-2xl">{service.title}</CardTitle>
                  <CardDescription className="mt-3 leading-7 text-slate-600">{service.description}</CardDescription>
                  <Button variant="ghost" asChild className="mt-6 h-10 rounded-full px-0 text-[#0A3D91] hover:bg-transparent">
                    <Link to="/contact">
                      Talk to an advisor
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="bg-[#061B3A] py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#D4AF37]">Service standard</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">Every account should feel easy to understand and safe to use.</h2>
            <p className="mt-5 text-lg leading-8 text-blue-100">
              Westlakes products are presented with plain-language details, responsive advice, and digital journeys that avoid unnecessary complexity.
            </p>
          </div>
          <div className="grid gap-4">
            {whyChooseItems.map((item) => (
              <div key={item.title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                <CheckCircle2 className="mt-1 size-5 shrink-0 text-[#D4AF37]" />
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-blue-100">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
