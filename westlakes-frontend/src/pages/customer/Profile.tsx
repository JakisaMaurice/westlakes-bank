import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Profile() {
  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Profile</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Manage your account details</h1>
      </div>
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <form className="grid gap-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
              <Input type="text" defaultValue="Jordan Avery" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email address</label>
              <Input type="email" defaultValue="jordan.avery@westlakesbank.com" />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Phone number</label>
              <Input type="tel" defaultValue="+44 20 7946 6800" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Country</label>
              <Input type="text" defaultValue="United Kingdom" />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Address</label>
            <Input type="text" defaultValue="1200 Lakeshore Drive, London SW1A 1AA" />
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600">Update your profile details and keep your contact information current.</div>
            <Button type="submit" className="rounded-full bg-slate-950 px-6 py-3 text-white hover:bg-slate-800">Save changes</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
