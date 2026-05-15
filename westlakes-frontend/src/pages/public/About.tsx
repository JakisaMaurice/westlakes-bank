import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function About() {
  return (
    <div className="space-y-12">
      <section className="rounded-[2rem] bg-white p-10 shadow-sm shadow-slate-200/60">
        <div className="max-w-3xl space-y-6">
          <p className="text-sm uppercase tracking-[0.32em] text-amber-500">About Westlakes Bank</p>
          <h1 className="text-4xl font-semibold text-slate-950 sm:text-5xl">Building a modern banking experience that earns trust.</h1>
          <p className="text-lg leading-8 text-slate-600">
            Westlakes Bank combines premium service, thoughtful digital tools, and secure finance solutions designed for individuals and businesses. Our mission is to create banking that feels confident, transparent, and easy to use.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-full px-6 py-3">
              <Link to="/careers">Join our team</Link>
            </Button>
            <Button variant="outline" asChild className="rounded-full px-6 py-3 text-slate-900 border-slate-200 hover:border-amber-300">
              <Link to="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-3">
        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-8">
          <h2 className="text-2xl font-semibold text-slate-950">Our story</h2>
          <p className="mt-4 text-slate-600 leading-7">
            Founded to serve modern customers with smarter banking, Westlakes Bank delivers a refined mix of digital convenience and human expertise.
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-8">
          <h2 className="text-2xl font-semibold text-slate-950">Mission</h2>
          <p className="mt-4 text-slate-600 leading-7">
            Empower every customer to reach financial goals by making banking easier, safer, and more intuitive.
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-8">
          <h2 className="text-2xl font-semibold text-slate-950">Vision</h2>
          <p className="mt-4 text-slate-600 leading-7">
            Be the trusted financial partner for a new generation of ambitious households and businesses.
          </p>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-6 rounded-[1.75rem] border border-slate-200 bg-white p-10 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-500">Leadership</p>
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
          <p className="text-sm uppercase tracking-[0.3em] text-amber-500">Company timeline</p>
          <div className="mt-8 space-y-6">
            {[
              { year: "2008", event: "Westlakes Bank founded with a mission for modern banking." },
              { year: "2016", event: "Expanded nationwide with new digital banking services." },
              { year: "2023", event: "Launched next-generation customer account tools." },
            ].map((item) => (
              <div key={item.year} className="flex items-start gap-4">
                <div className="mt-1 h-2.5 min-w-[2.5rem] rounded-full bg-amber-300 text-center text-sm font-semibold text-slate-950">{item.year}</div>
                <p className="text-slate-600 leading-7">{item.event}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
