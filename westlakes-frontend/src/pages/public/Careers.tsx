import SectionHeading from "@/components/shared/SectionHeading"
import { careerRoles, companyValues } from "@/components/shared/siteData"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"

export default function Careers() {
  return (
    <div>
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="Careers"
            title="Build banking experiences people can trust."
            description="Join a team focused on secure financial products, thoughtful customer service, and modern digital craft."
          />
          <div className="rounded-3xl bg-[#061B3A] p-8 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#D4AF37]">Culture</p>
            <p className="mt-5 text-3xl font-semibold leading-tight">
              Calm, capable teams doing meaningful work for customers with real financial goals.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {companyValues.slice(0, 3).map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.title} className="rounded-2xl border-slate-200 bg-white p-2 shadow-sm">
                <CardContent className="p-5">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#1E5EFF]/10 text-[#0A3D91]">
                    <Icon className="size-5" />
                  </span>
                  <CardTitle className="mt-5 text-xl">{item.title}</CardTitle>
                  <CardDescription className="mt-3 leading-7 text-slate-600">{item.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Open roles"
            title="Current public-site career listings."
            description="These roles are presented for the public website only. Application processing is not wired to a backend here."
          />
          <div className="mt-10 grid gap-5">
            {careerRoles.map((role) => (
              <Card key={role.title} className="rounded-2xl border-slate-200 bg-[#F8FAFC] p-2 shadow-sm">
                <CardContent className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <CardTitle className="text-2xl">{role.title}</CardTitle>
                    <p className="mt-2 text-sm font-semibold uppercase tracking-[0.22em] text-[#D4AF37]">
                      {role.location} · {role.type}
                    </p>
                    <CardDescription className="mt-4 max-w-3xl leading-7 text-slate-600">{role.description}</CardDescription>
                  </div>
                  <Button className="h-11 rounded-full bg-[#0A3D91] px-6 text-white hover:bg-[#1E5EFF]">Apply Now</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
