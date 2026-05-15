import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import SectionHeading from "@/components/shared/SectionHeading"
import { ShieldCheck, Sparkles, Users } from "lucide-react"

const roles = [
  { title: "Relationship Manager", location: "London", description: "Support clients with premium banking solutions and account guidance." },
  { title: "Digital Product Designer", location: "Remote", description: "Design intuitive banking experiences that feel modern and trustworthy." },
  { title: "Compliance Analyst", location: "London", description: "Help maintain risk standards and ensure safe, compliant banking operations." },
]

const cultureItems = [
  { title: "Collaborative teams", description: "Work alongside experienced professionals in a people-first culture.", icon: Users },
  { title: "Growth mindset", description: "Access training and mentorship to build a long-term banking career.", icon: Sparkles },
  { title: "Trusted service", description: "Deliver secure, transparent experiences that customers rely on.", icon: ShieldCheck },
]

export default function Careers() {
  return (
    <div className="space-y-14">
      <section className="rounded-[2rem] bg-white p-10 shadow-sm shadow-slate-200/60">
        <SectionHeading
          eyebrow="Careers"
          title="Be part of banking that makes customers feel secure and supported."
          description="Build your career at Westlakes Bank, where innovation, service excellence, and people-first values shape every customer interaction."
        />
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">Our culture</h2>
          <p className="mt-4 text-slate-600 leading-7">
            We empower people who want to deliver modern banking with clarity, agility, and thoughtful customer care.
          </p>
          <div className="mt-8 space-y-4">
            {cultureItems.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-amber-50 text-amber-600 shadow-sm">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-slate-600 leading-7">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-6">
          {roles.map((role) => (
            <Card key={role.title} className="rounded-[1.75rem] border-slate-200">
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle>{role.title}</CardTitle>
                    <p className="text-sm uppercase tracking-[0.24em] text-amber-500">{role.location}</p>
                  </div>
                </div>
                <CardDescription>{role.description}</CardDescription>
                <Button className="rounded-full bg-slate-950 px-5 py-3 text-white hover:bg-slate-800">Apply now</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
