import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link } from "react-router-dom"

export default function ForgotPassword() {
  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <section className="rounded-[2rem] bg-white p-10 shadow-sm shadow-slate-200/60">
        <p className="text-sm uppercase tracking-[0.32em] text-amber-500">Reset password</p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-950 sm:text-5xl">Recover access to your account.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Enter your email and we will send secure instructions to reset your password and get you back into your dashboard.
        </p>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-slate-50 p-10 shadow-sm">
        <form className="grid gap-5">
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">Email address</label>
            <Input type="email" placeholder="name@example.com" />
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Remembered your password? <Link to="/login" className="text-amber-600 hover:text-amber-500">Sign in</Link>
            </p>
            <Button type="submit" className="rounded-full px-6 py-3 bg-slate-950 text-white hover:bg-slate-800">
              Send reset link
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}
