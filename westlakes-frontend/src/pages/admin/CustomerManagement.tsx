import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"

const customers = [
  { name: "Liam Carter", status: "Active", product: "Savings" },
  { name: "Hannah Kim", status: "Pending", product: "Business" },
  { name: "Noah Smith", status: "Active", product: "Current" },
]

export default function CustomerManagement() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Customer management</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">Manage customer relationships</h1>
        </div>
        <Button className="rounded-full bg-slate-950 px-6 py-3 text-white hover:bg-slate-800">Invite new customer</Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {customers.map((customer) => (
          <Card key={customer.name} className="rounded-[1.75rem] border-slate-200">
            <CardContent className="space-y-4">
              <CardTitle>{customer.name}</CardTitle>
              <CardDescription>{customer.product}</CardDescription>
              <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-700">Status: {customer.status}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Customer search</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <input className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20" placeholder="Search by name or account" />
          <Button className="rounded-full bg-slate-950 px-6 py-3 text-white hover:bg-slate-800">Search</Button>
        </div>
      </div>
    </div>
  )
}
