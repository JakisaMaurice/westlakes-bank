import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

import SectionHeading from "@/components/shared/SectionHeading"
import { serviceItems } from "@/components/shared/siteData"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"

const displayedServices = serviceItems.slice(0, 3)

export default function ServicesSection() {
  return (
    <section className="bg-[#061B3A] py-20 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-end md:justify-between lg:px-8">
        <SectionHeading
          eyebrow="Banking services"
          title="Every product feels connected, secure, and clear."
          description="A focused suite for personal customers, founders, families, and established businesses."
          className="[&_h2]:text-white [&_p:last-child]:text-blue-100"
        />
        <Button variant="outline" asChild className="h-11 w-fit rounded-full border-white/20 bg-white/10 px-5 text-white hover:bg-white/15">
          <Link to="/services">
            View all services
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-6 px-4 sm:px-6 md:flex-row lg:px-8">
        {displayedServices.map((service) => {
          const Icon = service.icon

          return (
            <Card
              key={service.title}
              className="w-full rounded-2xl border-white/15 bg-white p-2 shadow-2xl shadow-black/25"
            >
              <CardContent className="space-y-5 p-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D4AF37]">{service.eyebrow}</span>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0A3D91] text-white">
                    <Icon className="size-5" />
                  </span>
                </div>
                <CardTitle className="text-2xl text-[#0F172A]">{service.title}</CardTitle>
                <CardDescription className="leading-7 text-slate-600">{service.description}</CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
