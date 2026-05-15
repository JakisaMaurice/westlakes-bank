import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import SectionHeading from "@/components/shared/SectionHeading"
import { Globe2, ShieldCheck, Sparkles, TrendingUp } from "lucide-react"

const values = [
  { title: "Security first", description: "We protect your funds with multiple layers of encryption and fraud monitoring.", icon: ShieldCheck },
  { title: "Digital clarity", description: "Easy-to-use banking tools designed for smooth everyday money management.", icon: Sparkles },
  { title: "Smart advice", description: "Support and product guidance tailored to your personal goals.", icon: TrendingUp },
  { title: "Trusted experience", description: "Premium financial service built on reliability and thoughtful design.", icon: Globe2 },
]

export default function About() {
  return (
    <div className="space-y-14">
      <section className="rounded-[2rem] bg-slate-950 p-10 text-white shadow-2xl shadow-slate-950/20">
        <SectionHeading
          eyebrow="About Westlakes Bank"
          title="Building modern banking that feels trusted and premium."
          description="We deliver secure accounts, transparent advice, and digital experiences for customers seeking stability and clarity."
          className="text-white"
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[1.75rem] bg-white/5 p-8 ring-1 ring-white/10">
            <p className="text-slate-200 leading-8">
              Westlakes Bank brings together digital-first banking, high-touch service, and smart financial tools. Our goal is to help families and businesses manage money with greater ease and confidence.
            </p>
          </div>
          <div className="rounded-[1.75rem] bg-white/5 p-8 ring-1 ring-white/10">
            <p className="text-slate-200 leading-8">
              From secure everyday accounts to lending and investment guidance, we build product experiences that feel premium, intuitive, and dependable.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {values.map((value) => {
          const Icon = value.icon
          return (
            <Card key={value.title} className="rounded-[1.75rem] border-slate-200">
              <CardContent className="flex flex-col gap-4">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-50 text-amber-600 shadow-sm">
                  <Icon className="size-6" />
                </div>
                <CardTitle>{value.title}</CardTitle>
                <CardDescription>{value.description}</CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <section className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6 rounded-[1.75rem] border border-slate-200 bg-white p-10 shadow-sm">
          <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Leadership</p>
          <div className="space-y-6">
            {[
              { name: "Amelia Hart", role: "Chief Executive Officer" },
              { name: "Noah Bennett", role: "Chief Financial Officer" },
              { name: "Leila Morgan", role: "Head of Customer Experience" },
            ].map((leader) => (
              <div key={leader.name} className="rounded-3xl bg-slate-50 p-6">
                <p className="text-xl font-semibold text-slate-950">{leader.name}</p>
                <p className="mt-2 text-sm text-slate-600">{leader.role}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-10 shadow-sm">
          <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Company timeline</p>
          <div className="mt-8 space-y-6">
            {[
              { year: "2008", event: "Westlakes Bank founded to deliver smarter, more transparent banking." },
              { year: "2016", event: "Expanded into new markets with digital banking services and branch growth." },
              { year: "2023", event: "Introduced next-generation account tools with premium experience." },
            ].map((item) => (
              <div key={item.year} className="flex items-start gap-4">
                <div className="mt-1 h-3.5 min-w-[3rem] rounded-full bg-amber-300 text-center text-sm font-semibold text-slate-950">{item.year}</div>
                <p className="text-slate-600 leading-7">{item.event}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="rounded-[2rem] bg-slate-950 p-10 text-white shadow-2xl shadow-slate-950/20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-amber-300">Ready for your next step</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">Partner with a bank built for modern ambitions.</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="rounded-full bg-amber-400 px-6 py-3 text-slate-950 hover:bg-amber-300">
              <Link to="/contact">Talk to an advisor</Link>
            </Button>
            <Button variant="outline" asChild className="rounded-full border-white/20 px-6 py-3 text-white hover:border-amber-300/70">
              <Link to="/careers">Join our team</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
