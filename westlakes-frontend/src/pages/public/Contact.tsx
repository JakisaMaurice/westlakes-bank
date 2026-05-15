import SectionHeading from "@/components/shared/SectionHeading"
import { brand, contactCards } from "@/components/shared/siteData"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function Contact() {
  return (
    <div>
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="Contact"
            title="Reach a Westlakes specialist."
            description="Questions about accounts, lending, business banking, careers, or public website information can start here."
          />
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {contactCards.map((card) => {
              const Icon = card.icon
              return (
                <Card key={card.title} className="rounded-2xl border-slate-200 bg-[#F8FAFC] p-2 shadow-sm">
                  <CardContent className="flex gap-4 p-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-[#0A3D91] shadow-sm">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <CardTitle className="text-base">{card.title}</CardTitle>
                      <CardDescription className="mt-1 leading-6 text-slate-600">{card.description}</CardDescription>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <form className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#D4AF37]">Send a message</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Input className="h-12 rounded-2xl bg-[#F8FAFC]" placeholder="Full name" type="text" />
            <Input className="h-12 rounded-2xl bg-[#F8FAFC]" placeholder="Email address" type="email" />
          </div>
          <Input className="mt-4 h-12 rounded-2xl bg-[#F8FAFC]" placeholder="Phone number" type="tel" />
          <textarea
            className="mt-4 min-h-40 w-full rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-sm outline-none transition focus:border-[#1E5EFF] focus:ring-3 focus:ring-[#1E5EFF]/20"
            placeholder="How can we help?"
          />
          <Button type="submit" className="mt-5 h-12 rounded-full bg-[#0A3D91] px-6 text-white hover:bg-[#1E5EFF]">
            Send Message
          </Button>
        </form>

        <div className="rounded-3xl bg-[#0A3D91] p-8 text-white shadow-2xl shadow-[#0A3D91]/20">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#D4AF37]">Visit us</p>
          <h2 className="mt-4 text-3xl font-semibold">Head office and appointment hours</h2>
          <p className="mt-4 leading-8 text-blue-100">{brand.address}</p>
          <div className="mt-8 grid gap-3">
            {["Monday-Friday: 8:00 AM-6:00 PM", "Saturday: By appointment", "Digital support: 24/7"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/10 p-4 text-blue-50">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
