import SectionHeading from "@/components/shared/SectionHeading"
import { testimonials } from "@/components/shared/siteData"

export default function TestimonialsSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          align="center"
          eyebrow="Client voices"
          title="Trusted by people who expect more from their bank."
          description="A premium experience matters most when customers are making serious financial decisions."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-7">
              <p className="text-lg leading-8 text-slate-700">"{item.quote}"</p>
              <div className="mt-7 flex items-center gap-4 border-t border-slate-200 pt-5">
                <img
                  src={item.image}
                  alt={`${item.name}, ${item.role}`}
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-white"
                />
                <div>
                  <p className="font-semibold text-[#0F172A]">{item.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
