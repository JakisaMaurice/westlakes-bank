import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Transfers() {
  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Transfers</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Move money securely</h1>
        <p className="mt-4 max-w-2xl text-slate-600 leading-7">
          Transfer funds between your accounts or send money to external beneficiaries with a secure, easy workflow.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_0.7fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <form className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">From account</label>
              <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20">
                <option>Everyday Current - **** 3482</option>
                <option>Growth Savings - **** 8721</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">To account</label>
              <Input type="text" placeholder="Beneficiary name or account" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Amount</label>
              <Input type="text" placeholder="£0.00" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Reference</label>
              <Input type="text" placeholder="Payment reference" />
            </div>
            <Button type="submit" className="rounded-full bg-slate-950 px-6 py-3 text-white hover:bg-slate-800">Send transfer</Button>
          </form>
        </div>

        <div className="space-y-5 rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Transfer tips</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">Fast and secure payments</h2>
          </div>
          <div className="space-y-4 text-slate-600">
            <p>• Confirm beneficiary details before sending.</p>
            <p>• Use instant transfers for prioritized payments.</p>
            <p>• Review your recent transfers in the transactions tab.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
