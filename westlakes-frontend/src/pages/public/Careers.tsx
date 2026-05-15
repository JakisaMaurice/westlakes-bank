import { Button } from "@/components/ui/button"

const roles = [
  { title: "Relationship Manager", location: "London" },
  { title: "Digital Product Designer", location: "Remote" },
  { title: "Compliance Analyst", location: "London" },
]

export default function Careers() {
  return (
    <div className="space-y-12">
      <section className="rounded-[2rem] bg-white p-10 shadow-sm shadow-slate-200/60">
        <p className="text-sm uppercase tracking-[0.32em] text-amber-500">Careers</p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-950 sm:text-5xl">Be part of banking that makes customers feel secure and supported.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Build your career at Westlakes Bank, where innovation, service excellence, and people-first values shape every customer interaction.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">Company culture</h2>
          <p className="mt-4 text-slate-600 leading-7">
            We foster growth, collaboration, and trusted decision-making. Our teams work together to deliver secure banking with clarity and care.
          </p>
          <ul className="mt-6 space-y-4 text-slate-600">
            <li>• Collaborative teams with mentorship and development.</li>
            <li>• A modern digital-first banking environment.</li>
            <li>• Competitive benefits and flexible working policies.</li>
          </ul>
          <Button className="mt-8 rounded-full bg-slate-950 px-6 py-3 text-white hover:bg-slate-800">
            Explore opportunities
          </Button>
        </div>

        <div className="space-y-5">
          {roles.map((role) => (
            <div key={role.title} className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-950">{role.title}</h3>
              <p className="mt-2 text-sm uppercase tracking-[0.24em] text-amber-500">{role.location}</p>
              <p className="mt-4 text-slate-600">A rewarding role for banking professionals who want to build secure customer experiences.</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
