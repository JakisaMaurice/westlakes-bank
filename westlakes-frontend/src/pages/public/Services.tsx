import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import SectionHeading from "@/components/shared/SectionHeading"
import { ArrowRight, Briefcase, CreditCard, Globe2, PiggyBank, ShieldCheck, Sparkles, TrendingUp } from "lucide-react"

const serviceCards = [
  { title: "Savings accounts", description: "High-earning savings accounts with flexible access and smart management.", icon: PiggyBank },
  { title: "Current accounts", description: "Everyday accounts built for personal and business cash flow.", icon: Briefcase },
  { title: "Loans & credit", description: "Transparent lending for mortgages, auto, and working capital needs.", icon: CreditCard },
  { title: "Investments", description: "Wealth planning and advisory tools for long-term growth.", icon: TrendingUp },
  { title: "Credit facilities", description: "Personal and business credit lines with reliable approval support.", icon: Sparkles },
]

const features = [
  { title: "Flexible account access", description: "Online and mobile account tools for monitoring balances and payments.", icon: Globe2 },
  { title: "Tailored financial support", description: "Personalized guidance from advisers and dedicated support specialists.", icon: ShieldCheck },
  { title: "Fast onboarding", description: "Simplified application workflows and clear service terms.", icon: Sparkles },
]

export default function Services() {
  return (
    <div className="space-y-14">
      <section className="rounded-[2rem] bg-white p-10 shadow-sm shadow-slate-200/60">
        <SectionHeading
          eyebrow="Services"
          title="Banking solutions built around your financial goals."
          description="Discover accounts, credit, investing, and business banking designed to make every step easier, more secure, and more rewarding."
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {serviceCards.map((service) => {
          const Icon = service.icon
          return (
            <Card key={service.title} className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white">
              <CardContent className="space-y-5">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-50 text-amber-600 shadow-sm">
                  <Icon className="size-6" />
                </div>
                <CardTitle>{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardContent>
              <div className="px-6 pb-6 pt-0">
                <Button variant="ghost" size="sm" className="gap-2 text-slate-700 hover:text-slate-900">
                  Learn more <ArrowRight className="size-4" />
                </Button>
              </div>
            </Card>
          )
        })}
      </section>

      <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] bg-slate-950 p-10 text-white shadow-2xl shadow-slate-950/20">
          <p className="text-sm uppercase tracking-[0.28em] text-amber-300">Service approach</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">Designed for clarity, convenience and long-term growth.</h2>
          <p className="mt-6 max-w-2xl leading-8 text-slate-300">
            Westlakes Bank brings modern digital banking together with expert support to help you move forward confidently, whether you're saving, borrowing, or investing.
          </p>
        </div>
        <div className="grid gap-5">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-amber-50 text-amber-600 shadow-sm">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-950">{feature.title}</h3>
                <p className="mt-3 text-slate-600 leading-7">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-[2rem] bg-slate-50 p-10 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Plan ahead</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-950">Simplify your banking with expert support and flexible products.</h2>
          </div>
          <Button asChild className="rounded-full bg-slate-950 px-6 py-3 text-white hover:bg-slate-800">
            <a href="#">Get started</a>
          </Button>
        </div>
      </section>
    </div>
  )
}
