import { useState, type FormEvent } from "react"

import SectionHeading from "@/components/shared/SectionHeading"
import { brand, contactCards } from "@/components/shared/siteData"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"

const contactEndpoint = import.meta.env.VITE_CONTACT_ENDPOINT ?? "/api/contact/"

export default function Contact() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "success" | "fallback" | "error">("idle")
  const [loading, setLoading] = useState(false)

  function openEmailFallback() {
    const subject = encodeURIComponent(`${import.meta.env.VITE_APP_NAME ?? "Westlakes Bank"} inquiry from ${fullName}`)
    const body = encodeURIComponent(
      `Name: ${fullName}\nEmail: ${email}\nPhone: ${phoneNumber || "Not provided"}\n\nMessage:\n${message}`
    )
    window.location.href = `mailto:${brand.email}?subject=${subject}&body=${body}`
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus("idle")
    setLoading(true)

    try {
      await api.post(contactEndpoint, {
        full_name: fullName,
        email,
        phone_number: phoneNumber,
        message,
      })

      setStatus("success")
      setFullName("")
      setEmail("")
      setPhoneNumber("")
      setMessage("")
    } catch {
      openEmailFallback()
      setStatus("fallback")
    } finally {
      setLoading(false)
    }
  }

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
        <form className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" onSubmit={handleSubmit}>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#D4AF37]">Send a message</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Input
              className="h-12 rounded-2xl bg-[#F8FAFC]"
              placeholder="Full name"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
            <Input
              className="h-12 rounded-2xl bg-[#F8FAFC]"
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <Input
            className="mt-4 h-12 rounded-2xl bg-[#F8FAFC]"
            placeholder="Phone number"
            type="tel"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
          />
          <textarea
            className="mt-4 min-h-40 w-full rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-sm outline-none transition focus:border-[#1E5EFF] focus:ring-3 focus:ring-[#1E5EFF]/20"
            placeholder="How can we help?"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            required
          />
          {status === "success" ? (
            <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              Message sent successfully.
            </p>
          ) : null}
          {status === "fallback" ? (
            <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
              We opened your email client with this message because the contact endpoint is not available.
            </p>
          ) : null}
          {status === "error" ? (
            <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              Unable to send your message. Please email {brand.email}.
            </p>
          ) : null}
          <Button type="submit" className="mt-5 h-12 rounded-full bg-[#0A3D91] px-6 text-white hover:bg-[#1E5EFF]" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
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
