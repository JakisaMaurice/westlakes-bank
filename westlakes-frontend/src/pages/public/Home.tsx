import { ArrowRight, Globe2, ShieldCheck, Sparkles, TrendingUp, Wallet, CreditCard, Headphones, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Link } from "react-router-dom"

const serviceCards = [
  { title: "Personal Banking", description: "Savings, checking and tailored everyday banking for individuals.", icon: Wallet },
  { title: "Business Banking", description: "Growth-focused accounts, payments and cash management for enterprises.", icon: Briefcase },
  { title: "Loans & Credit", description: "Flexible financing with transparent rates for home, auto, and business needs.", icon: CreditCard },
  { title: "Investments", description: "Wealth planning, advisory services and investment strategies for long-term goals.", icon: TrendingUp },
]

const features = [
  { title: "Secure banking", description: "Advanced encryption and fraud monitoring keep every account safe.", icon: ShieldCheck },
  { title: "Fast transfers", description: "Move funds instantly with reliable digital payments and account access.", icon: Sparkles },
  { title: "24/7 support", description: "Dedicated customer care ready to help across channels any time.", icon: Headphones },
  { title: "Digital-first", description: "Streamlined mobile and online banking for modern financial lifestyle.", icon: Globe2 },
]

const testimonials = [
  { quote: "Westlakes Bank made it easy to move my business online with confidence.", author: "Ava Thompson, Founder" },
  { quote: "Their team helped me secure the right mortgage and supported every step.", author: "Marcus Lee, Homeowner" },
  { quote: "The mobile banking experience feels premium, fast and very secure.", author: "Priya Patel, Executive" },
]

const stats = [
  { label: "Customers", value: "120k+" },
  { label: "Branches", value: "34" },
  { label: "Years of service", value: "18" },
]

export default function Home() {
  return (
    <div className="space-y-24">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl shadow-slate-900/30">
        <div className="grid gap-12 px-6 py-14 lg:grid-cols-[1.2fr_1fr] lg:px-10 lg:py-20">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm text-amber-200">
              <Sparkles className="size-4" />
              Premium banking with a modern digital edge.
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-slate-400">Westlakes Bank</p>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Banking confidence for every ambition.
                </h1>
              </div>
              <p className="max-w-xl text-lg leading-8 text-slate-300">
                Delivering secure accounts, fast transfers and modern digital tools for individuals and businesses in a refined, trusted experience.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild className="rounded-full bg-amber-400 px-6 py-3 text-slate-950 hover:bg-amber-300 shadow-lg shadow-amber-400/20">
                <Link to="/register">Open Account</Link>
              </Button>
              <Button variant="outline" asChild className="rounded-full px-6 py-3 text-white border-white/20 hover:border-amber-300/40 hover:text-amber-100">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-white/5 p-5 text-slate-200 shadow-lg shadow-slate-950/30">
                <p className="text-3xl font-semibold">99.98%</p>
                <p className="mt-2 text-sm text-slate-400">Uptime and secure access.</p>
              </div>
              <div className="rounded-3xl bg-white/5 p-5 text-slate-200 shadow-lg shadow-slate-950/30">
                <p className="text-3xl font-semibold">34</p>
                <p className="mt-2 text-sm text-slate-400">Smart branches nationwide.</p>
              </div>
              <div className="rounded-3xl bg-white/5 p-5 text-slate-200 shadow-lg shadow-slate-950/30">
                <p className="text-3xl font-semibold">24/7</p>
                <p className="mt-2 text-sm text-slate-400">Support for every customer.</p>
              </div>
            </div>
          </div>

          <div className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-amber-400/10 via-slate-900 to-slate-800 p-8 text-slate-50 shadow-2xl shadow-slate-950/40 sm:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.18),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(56,189,248,0.16),_transparent_25%)]" />
            <div className="relative space-y-8">
              <div className="rounded-3xl border border-white/10 bg-slate-950/90 p-6 shadow-xl shadow-slate-950/20">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Account balance</p>
                    <p className="mt-3 text-3xl font-semibold">£32,400.50</p>
                  </div>
                  <div className="rounded-2xl bg-amber-400/15 px-3 py-2 text-amber-200">Active</div>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-900/90 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Savings</p>
                    <p className="mt-2 text-lg font-semibold">£14,280</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/90 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Current</p>
                    <p className="mt-2 text-lg font-semibold">£18,120</p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/85 p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Latest movement</p>
                <div className="mt-6 space-y-4">
                  {[
                    { label: "Salary payment", amount: "+£3,450", time: "Today" },
                    { label: "Utility transfer", amount: "-£185", time: "Yesterday" },
                    { label: "Credit card repayment", amount: "-£420", time: "2 days ago" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-4 rounded-3xl bg-slate-900/80 p-4">
                      <div>
                        <p className="font-medium text-slate-100">{item.label}</p>
                        <p className="text-sm text-slate-500">{item.time}</p>
                      </div>
                      <p className={`text-sm font-semibold ${item.amount.startsWith("+") ? "text-emerald-300" : "text-slate-200"}`}>
                        {item.amount}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-500">Why choose Westlakes</p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Financial clarity backed by trust and performance.</h2>
          <p className="max-w-2xl text-slate-600">
            We focus on a secure banking experience with rapid digital service, tailored support, and premium tools that help households and companies manage money with confidence.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-amber-50 text-amber-600 shadow-sm">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-500">Our services</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">Banking solutions for every goal.</h2>
          </div>
          <Button asChild className="rounded-full px-5 py-3 text-slate-950 bg-slate-900/5 text-sm hover:bg-slate-900/10">
            <Link to="/services">Explore services</Link>
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {serviceCards.map((service) => {
            const Icon = service.icon
            return (
              <Card key={service.title} className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white">
                <CardContent className="space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-950 text-white shadow-lg shadow-slate-950/10">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle>{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardContent>
                <div className="px-4 pb-4 pt-2">
                  <Button variant="ghost" size="sm" className="gap-2 text-slate-700 hover:text-slate-900">
                    Learn more <ArrowRight className="size-4" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-10 text-white shadow-2xl shadow-slate-950/30">
          <p className="text-sm uppercase tracking-[0.28em] text-amber-300">Digital banking</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">Modern banking tools you can rely on.</h2>
          <p className="mt-4 max-w-xl text-slate-300 leading-8">
            Access accounts, move money, and track results through a secure mobile and online experience built for speed and simplicity.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold text-white">Mobile banking</p>
              <p className="mt-2 text-sm text-slate-300">Full control from your device with instant alerts and transfers.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold text-white">Internet banking</p>
              <p className="mt-2 text-sm text-slate-300">Manage accounts, pay bills and monitor spending from the browser.</p>
            </div>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.25em] text-amber-500">Fast transfers</p>
            <h3 className="mt-4 text-2xl font-semibold text-slate-950">Move funds in seconds.</h3>
            <p className="mt-3 text-slate-600 leading-7">Send money to accounts, pay invoices, and fund savings with fast, transparent processing.</p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.25em] text-amber-500">Support</p>
            <h3 className="mt-4 text-2xl font-semibold text-slate-950">Guidance whenever you need it.</h3>
            <p className="mt-3 text-slate-600 leading-7">Customer care, account advisory, and secure messaging built for the modern banking journey.</p>
          </div>
        </div>
      </section>

      <section className="space-y-10">
        <div className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-amber-500">What our clients say</p>
          <h2 className="text-3xl font-semibold text-slate-950 sm:text-4xl">Trusted by customers who value clarity and care.</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((item) => (
            <div key={item.author} className="rounded-[1.75rem] border border-slate-200/80 bg-white p-8 shadow-sm">
              <p className="text-lg leading-8 text-slate-700">“{item.quote}”</p>
              <p className="mt-6 text-sm font-semibold text-slate-950">{item.author}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-10 text-white shadow-2xl shadow-slate-950/40">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-amber-300">Begin with confidence</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Start banking with a trusted partner.</h2>
            <p className="mt-4 max-w-2xl text-slate-300 leading-7">
              Open your account today and enjoy secure banking with expert support, premium digital access, and fast transfers.
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:justify-end">
            <Button asChild className="rounded-full bg-amber-400 px-6 py-3 text-slate-950 hover:bg-amber-300">
              <Link to="/register">Open an account</Link>
            </Button>
            <Button variant="outline" asChild className="rounded-full border-white/20 px-6 py-3 text-white hover:border-amber-300/40">
              <Link to="/contact">Speak with our team</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        {stats.map((item) => (
          <div key={item.label} className="rounded-[1.75rem] border border-slate-200/80 bg-white p-8 text-center shadow-sm">
            <p className="text-4xl font-semibold text-slate-950">{item.value}</p>
            <p className="mt-3 text-sm uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
