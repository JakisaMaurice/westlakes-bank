import SectionHeading from "@/components/shared/SectionHeading"
import { whyChooseItems } from "@/components/shared/siteData"

export default function WhyChooseUsSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <SectionHeading
            eyebrow="Why Westlakes"
            title="Private-bank polish with digital-bank speed."
            description="Security, service, and usability shape every public touchpoint of Westlakes Bank."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_0.75fr]">
            <img
              src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=80"
              alt="Westlakes advisor meeting with banking clients"
              className="h-72 w-full rounded-2xl object-cover shadow-xl shadow-slate-950/10"
            />
            <div className="grid gap-4">
              <img
                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=520&q=80"
                alt="Westlakes business customer using digital banking"
                className="h-32 w-full rounded-2xl object-cover shadow-lg shadow-slate-950/10"
              />
              <div className="rounded-2xl bg-[#0A3D91] p-5 text-white shadow-lg shadow-[#0A3D91]/20">
                <p className="text-3xl font-semibold">320K+</p>
                <p className="mt-2 text-sm leading-6 text-blue-100">Customers supported by real people and reliable digital access.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {whyChooseItems.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-6">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#0A3D91] shadow-sm">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 text-xl font-semibold text-[#0F172A]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
