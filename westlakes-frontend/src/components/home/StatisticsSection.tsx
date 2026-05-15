import { stats } from "@/components/shared/siteData"

export default function StatisticsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-950/5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="border-b border-slate-200 p-8 last:border-b-0 sm:border-r sm:last:border-r-0 lg:border-b-0">
            <p className="text-4xl font-semibold tracking-tight text-[#0A3D91]">{item.value}</p>
            <p className="mt-3 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
