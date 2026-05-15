import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Briefcase, CreditCard, PiggyBank, Sparkles, TrendingUp } from "lucide-react"

const services = [
  {
    title: "Savings accounts",
    description: "High-yield savings with easy access and secure management online.",
    icon: PiggyBank,
  },
  {
    title: "Current accounts",
    description: "Flexible everyday banking accounts for personal and business use.",
    icon: Briefcase,
  },
  {
    title: "Loans & financing",
    description: "Competitive lending solutions for home, auto, and working capital.",
    icon: CreditCard,
  },
  {
    title: "Investments",
    description: "Smart portfolios and financial planning to grow your wealth.",
    icon: TrendingUp,
  },
  {
    title: "Credit facilities",
    description: "Custom credit lines backed by responsible underwriting and support.",
    icon: Sparkles,
  },
]

export default function Services() {
  return (
    <div className="space-y-12">
      <section className="rounded-[2rem] bg-white p-10 shadow-sm shadow-slate-200/60">
        <p className="text-sm uppercase tracking-[0.32em] text-amber-500">Services</p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-950 sm:text-5xl">Banking solutions built around your financial goals.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Explore our full range of services designed to support savings, business growth, credit access, and investment planning with clarity and control.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => {
          const Icon = service.icon
          return (
            <Card key={service.title} className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white">
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
    </div>
  )
}
