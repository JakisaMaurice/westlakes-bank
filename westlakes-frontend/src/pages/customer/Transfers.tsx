import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"

export default function Transfers() {
  const [receiverAccount, setReceiverAccount] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      await api.post("/api/transactions/transfer/", {
        receiver_account_number: receiverAccount,
        amount: Number(amount),
        description,
      })
      setSuccess("Transfer submitted successfully.")
      setReceiverAccount("")
      setAmount("")
      setDescription("")
    } catch (err) {
      setError("Could not send transfer. Check the account number and amount.")
    } finally {
      setLoading(false)
    }
  }

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
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Beneficiary account number</label>
              <Input
                type="text"
                placeholder="1234567890"
                value={receiverAccount}
                onChange={(event) => setReceiverAccount(event.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Amount</label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
                min={0}
                step="0.01"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Reference</label>
              <Input
                type="text"
                placeholder="Payment reference"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
            <Button type="submit" className="rounded-full bg-slate-950 px-6 py-3 text-white hover:bg-slate-800" disabled={loading}>
              {loading ? "Sending transfer..." : "Send transfer"}
            </Button>
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
