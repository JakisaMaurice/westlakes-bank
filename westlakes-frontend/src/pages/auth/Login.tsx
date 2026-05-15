import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link } from "react-router-dom"

export default function Login() {
  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <section className="rounded-[2rem] bg-white p-10 shadow-sm shadow-slate-200/60">
        <p className="text-sm uppercase tracking-[0.32em] text-amber-500">Secure access</p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-950 sm:text-5xl">Login to your Westlakes account.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Access your accounts, view transactions, and manage your banking from a secure dashboard.
        </p>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-slate-50 p-10 shadow-sm">
        <form className="grid gap-5">
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">Email address</label>
            <Input type="email" placeholder="name@example.com" />
          </div>
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">Password</label>
            <Input type="password" placeholder="Enter your password" />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/forgot-password" className="text-sm text-amber-600 hover:text-amber-500">
              Forgot password?
            </Link>
            <Button type="submit" className="rounded-full px-6 py-3 bg-slate-950 text-white hover:bg-slate-800">
              Sign in
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}
