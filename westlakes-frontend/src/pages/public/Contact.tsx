import { Button } from "@/components/ui/button"

export default function Contact() {
  return (
    <div className="space-y-12">
      <section className="rounded-[2rem] bg-white p-10 shadow-sm shadow-slate-200/60">
        <p className="text-sm uppercase tracking-[0.32em] text-amber-500">Contact</p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-950 sm:text-5xl">Reach Westlakes Bank support and local branches.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Need help opening an account, discussing a product, or contacting our team? Send a message or visit a branch near you.
        </p>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">Office details</h2>
          <div className="mt-6 space-y-5 text-slate-600">
            <div>
              <p className="font-semibold text-slate-900">Head office</p>
              <p>1200 Lakeshore Drive</p>
              <p>London, SW1A 1AA</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Email</p>
              <p>support@westlakesbank.com</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Phone</p>
              <p>+44 20 7946 6800</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Branch locations</p>
              <p>Mayfair, Canary Wharf, Birmingham, Manchester</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.32em] text-amber-500">Send us a note</p>
          <form className="mt-6 grid gap-4">
            <input
              type="text"
              placeholder="Full name"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20"
            />
            <input
              type="email"
              placeholder="Email address"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20"
            />
            <textarea
              rows={5}
              placeholder="How can we help you?"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20"
            />
            <Button type="submit" className="rounded-full px-6 py-3 bg-slate-950 text-white hover:bg-slate-800">
              Send message
            </Button>
          </form>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.32em] text-amber-500">Map</p>
        <div className="mt-6 h-80 rounded-3xl bg-gradient-to-br from-slate-200 via-slate-300 to-slate-200" />
      </section>
    </div>
  )
}
