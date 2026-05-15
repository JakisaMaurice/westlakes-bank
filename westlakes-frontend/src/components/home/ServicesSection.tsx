import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

import SectionHeading from "@/components/shared/SectionHeading"
import { serviceItems } from "@/components/shared/siteData"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"

const flowDuration = 24

export default function ServicesSection() {
  return (
    <section className="overflow-hidden bg-[#061B3A] py-20 text-white">
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

      <div className="relative mt-12 h-[380px] overflow-hidden sm:h-[360px]">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#061B3A] to-transparent sm:w-40" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#061B3A] to-transparent sm:w-40" />
        <div className="pointer-events-none absolute left-1/2 top-0 z-0 h-full w-[360px] -translate-x-1/2 rounded-[2rem] bg-[#1E5EFF]/12 blur-2xl" />
        {serviceItems.map((service, index) => {
          const Icon = service.icon

          return (
            <Card
              key={service.title}
              className="westlakes-service-flow-card absolute left-1/2 top-8 w-[280px] rounded-2xl border-white/15 bg-white p-2 shadow-2xl shadow-black/25 sm:w-[320px]"
              style={{
                animationDelay: `-${(flowDuration / serviceItems.length) * index}s`,
                animationDuration: `${flowDuration}s`,
              }}
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
