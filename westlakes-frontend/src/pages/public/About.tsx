import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

import SectionHeading from "@/components/shared/SectionHeading"
import { companyValues } from "@/components/shared/siteData"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"

const milestones = [
  { year: "2008", label: "Westlakes Bank opens with a focus on relationship-led banking." },
  { year: "2016", label: "Digital banking expands across personal and business accounts." },
  { year: "2022", label: "Premium mobile tools and faster transfers become core to the customer experience." },
  { year: "2026", label: "The public website is refreshed around clarity, confidence, and modern access." },
]

export default function About() {
  return (
    <div>
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-20">
          <div>
            <SectionHeading
              eyebrow="About Westlakes"
              title="A modern bank shaped around confidence, care, and financial momentum."
              description="Westlakes Bank serves individuals, families, and businesses with a premium mix of secure technology and attentive relationship banking."
            />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12 rounded-full bg-[#0A3D91] px-6 text-white hover:bg-[#1E5EFF]">
                <Link to="/services">
                  Explore Services
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-12 rounded-full border-slate-200 px-6 text-[#0A3D91]">
                <Link to="/contact">Contact Our Team</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-[2rem] bg-[#0A3D91] p-8 text-white shadow-2xl shadow-[#0A3D91]/20">
            <p className="text-sm uppercase tracking-[0.28em] text-[#D4AF37]">Our promise</p>
            <p className="mt-5 text-3xl font-semibold leading-tight">
              We make banking feel simpler without making it feel smaller.
            </p>
            <p className="mt-5 leading-8 text-blue-100">
              Every page, product, and conversation is designed to help customers understand their options and act with confidence.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {companyValues.map((value) => {
            const Icon = value.icon
            return (
              <Card key={value.title} className="rounded-2xl border-slate-200 bg-white p-2 shadow-sm">
                <CardContent className="p-5">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#1E5EFF]/10 text-[#0A3D91]">
                    <Icon className="size-5" />
                  </span>
                  <CardTitle className="mt-5 text-xl">{value.title}</CardTitle>
                  <CardDescription className="mt-3 leading-7 text-slate-600">{value.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <SectionHeading
            eyebrow="How we grew"
            title="Built steadily, with the customer experience at the center."
            description="Westlakes combines banking discipline with design-minded digital service."
          />
          <div className="space-y-4">
            {milestones.map((item) => (
              <div key={item.year} className="grid gap-4 rounded-2xl border border-slate-200 bg-[#F8FAFC] p-5 sm:grid-cols-[6rem_1fr]">
                <p className="text-xl font-semibold text-[#0A3D91]">{item.year}</p>
                <p className="leading-7 text-slate-600">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
