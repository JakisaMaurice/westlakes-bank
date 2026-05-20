import { useState, type FormEvent } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import { Loader2, CheckCircle, AlertCircle, Plus } from "lucide-react"

const ACCOUNT_TYPES = [
  { value: "SAVINGS", label: "Savings Account", description: "Earn interest on your savings with easy access to funds" },
  { value: "CURRENT", label: "Current Account", description: "Everyday banking with unlimited transactions" },
  { value: "BUSINESS", label: "Business Account", description: "Designed for business transactions and operations" },
]

const CURRENCIES = [
  { value: "GBP", label: "British Pound (£)" },
  { value: "USD", label: "US Dollar ($)" },
  { value: "EUR", label: "Euro (€)" },
]

interface OpenAccountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function OpenAccountModal({ open, onOpenChange, onSuccess }: OpenAccountModalProps) {
  const [accountType, setAccountType] = useState("")
  const [currency, setCurrency] = useState("GBP")
  const [nickname, setNickname] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const resetForm = () => {
    setAccountType("")
    setCurrency("GBP")
    setNickname("")
    setReason("")
    setError("")
    setSuccess(false)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await api.post("/api/accounts/", {
        account_type: accountType,
        currency,
        nickname: nickname || undefined,
        reason: reason || undefined,
      })
      setSuccess(true)
      setTimeout(() => {
        onSuccess()
        onOpenChange(false)
        resetForm()
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.detail || "Failed to create account. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm()
        onOpenChange(v)
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-amber-500" />
            Open New Account
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="mt-4 text-lg font-semibold text-slate-900">Account Created!</p>
            <p className="mt-1 text-sm text-slate-500">Your account is pending admin approval.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Account Type *</label>
              <div className="space-y-2">
                {ACCOUNT_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                      accountType === type.value
                        ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="accountType"
                      value={type.value}
                      checked={accountType === type.value}
                      onChange={() => setAccountType(type.value)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-slate-900">{type.label}</p>
                      <p className="text-xs text-slate-500">{type.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Currency *</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Account Nickname <span className="text-slate-400">(optional)</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. Holiday Fund, Business Ops"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={50}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Reason for Opening <span className="text-slate-400">(optional)</span>
              </label>
              <Textarea
                placeholder="Briefly describe why you need this account..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!accountType || loading}
                className="bg-slate-950 hover:bg-slate-800"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
