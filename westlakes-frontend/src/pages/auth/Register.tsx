import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link } from "react-router-dom"

export default function Register() {
  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <section className="rounded-[2rem] bg-white p-10 shadow-sm shadow-slate-200/60">
        <p className="text-sm uppercase tracking-[0.32em] text-amber-500">Open account</p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-950 sm:text-5xl">Create your Westlakes Bank account.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Start your application with secure onboarding. We ask for the essential details to get your banking journey started.
        </p>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-slate-50 p-10 shadow-sm">
        <form className="grid gap-5">
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">Full name</label>
            <Input type="text" placeholder="John Doe" />
          </div>
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">Email address</label>
            <Input type="email" placeholder="name@example.com" />
          </div>
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">Phone number</label>
            <Input type="tel" placeholder="+44 20 1234 5678" />
          </div>
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">National ID / Passport</label>
            <Input type="text" placeholder="ID or passport number" />
          </div>
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">Password</label>
            <Input type="password" placeholder="Create a password" />
          </div>
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">Confirm password</label>
            <Input type="password" placeholder="Confirm your password" />
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Already have an account? <Link to="/login" className="text-amber-600 hover:text-amber-500">Sign in</Link>
            </p>
            <Button type="submit" className="rounded-full px-6 py-3 bg-slate-950 text-white hover:bg-slate-800">
              Create account
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}
