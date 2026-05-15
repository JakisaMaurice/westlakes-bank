import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function CtaSection() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] bg-[#0A3D91] p-8 text-white shadow-2xl shadow-[#0A3D91]/25 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#D4AF37]">Begin with Westlakes</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">A calmer, clearer banking relationship starts here.</h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-100">
            Open an account, compare services, or talk with a specialist about how Westlakes Bank can support your next move.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
          <Button asChild className="h-12 rounded-full bg-[#D4AF37] px-6 text-[#0F172A] hover:bg-[#e6c65a]">
            <Link to="/register">
              Open Account
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-12 rounded-full border-white/25 bg-transparent px-6 text-white hover:bg-white/10">
            <Link to="/contact">Talk to Us</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
