import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import SectionHeading from "@/components/shared/SectionHeading"
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { MapPin, Mail, Phone, Globe2 } from "lucide-react"

const contacts = [
  { title: "Head office", detail: "1200 Lakeshore Drive, London SW1A 1AA" },
  { title: "Email", detail: "support@westlakesbank.com" },
  { title: "Phone", detail: "+44 20 7946 6800" },
  { title: "Branches", detail: "Mayfair, Canary Wharf, Birmingham, Manchester" },
]

export default function Contact() {
  return (
    <div className="space-y-14">
      <section className="rounded-[2rem] bg-white p-10 shadow-sm shadow-slate-200/60">
        <SectionHeading
          eyebrow="Contact"
          title="Reach Westlakes Bank support and local branches."
          description="Need help opening an account, discussing a product, or contacting our team? Send a message or visit a branch near you."
        />
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            {contacts.map((item) => (
              <Card key={item.title} className="rounded-[1.75rem] border border-slate-200">
                <CardContent className="space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-900 text-white">
                    {item.title === "Email" ? <Mail className="size-5" /> : item.title === "Phone" ? <Phone className="size-5" /> : item.title === "Branches" ? <Globe2 className="size-5" /> : <MapPin className="size-5" />}
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.detail}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="rounded-[1.75rem] bg-white p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Office hours</p>
            <p className="mt-4 text-slate-600 leading-7">Monday to Friday, 8:00 AM – 6:00 PM. Our support team is available for inquiries and branch appointments.</p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.32em] text-amber-500">Send us a note</p>
          <form className="mt-6 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input type="text" placeholder="Full name" />
              <Input type="email" placeholder="Email address" />
            </div>
            <Input type="tel" placeholder="Phone number" />
            <textarea
              rows={5}
              placeholder="How can we help you?"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20"
            />
            <Button type="submit" className="rounded-full bg-slate-950 px-6 py-3 text-white hover:bg-slate-800">
              Send message
            </Button>
          </form>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Map</p>
            <p className="mt-3 max-w-xl text-slate-600 leading-7">Visit us at our head office or any of our branch locations. This placeholder represents a future embedded map.</p>
          </div>
          <div className="h-72 w-full rounded-3xl bg-gradient-to-br from-slate-200 via-slate-300 to-slate-200 lg:w-2/3" />
        </div>
      </section>
    </div>
  )
}
