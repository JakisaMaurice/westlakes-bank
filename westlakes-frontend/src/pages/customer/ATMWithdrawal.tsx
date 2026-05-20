import { useState, useEffect, useCallback, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { api } from "@/lib/api"
import { Loader2, CheckCircle, AlertCircle, Banknote, CreditCard } from "lucide-react"

interface Account {
  id: number
  account_number: string
  account_type: string
  balance: string
  status: string
  card_number: string | null
  card_status: string
  card_last_four_digits: string | null
  card_daily_limit: string
}

interface WithdrawalReceipt {
  transaction_reference: string
  amount: string
  status: string
  timestamp: string
  balance_after: string
  description: string
  sender_account_number: string
}

export default function ATMWithdrawal() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [amount, setAmount] = useState("")
  const [atmPin, setAtmPin] = useState("")
  const [transactionPin, setTransactionPin] = useState("")
  const [sending, setSending] = useState(false)
  const [receipt, setReceipt] = useState<WithdrawalReceipt | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const [withdrawalType, setWithdrawalType] = useState<"atm" | "counter">("atm")

  const fetchAccounts = useCallback(async () => {
    try {
      const response = await api.get<Account[]>("/api/accounts/")
      const active = response.data.filter((a) => a.status === "ACTIVE")
      setAccounts(active)
      if (active.length > 0 && !selectedAccount) {
        setSelectedAccount(active[0])
      }
    } catch {
      setError("Unable to load accounts.")
    } finally {
      setLoading(false)
    }
  }, [selectedAccount])

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    fetchAccounts()
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    if (!selectedAccount) {
      setError("Please select an account")
      return
    }

    const withdrawAmount = parseFloat(amount)
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (withdrawAmount > parseFloat(selectedAccount.balance)) {
      setError("Insufficient balance")
      return
    }

    if (!transactionPin || transactionPin.length < 4) {
      setError("Please enter your transaction PIN")
      return
    }

    if (withdrawalType === "atm") {
      if (!selectedAccount.card_number || selectedAccount.card_status !== "ACTIVE") {
        setError("No active ATM card for this account")
        return
      }
      if (!atmPin || atmPin.length !== 4) {
        setError("Please enter your 4-digit ATM PIN")
        return
      }
    }

    setSending(true)
    try {
      const endpoint = withdrawalType === "atm" ? "/api/transactions/atm-withdraw/" : "/api/transactions/withdraw/"
      const payload: Record<string, string | number> = {
        amount: withdrawAmount,
        description: withdrawalType === "atm" ? "ATM Withdrawal" : "Counter Withdrawal",
        transaction_pin: transactionPin,
      }
      if (withdrawalType === "atm") {
        payload.atm_pin = atmPin
        payload.card_number = selectedAccount.card_number!
      }

      const response = await api.post(endpoint, payload)
      setReceipt({
        transaction_reference: response.data.transaction_reference,
        amount: response.data.amount,
        status: response.data.status,
        timestamp: response.data.timestamp,
        balance_after: response.data.balance_after,
        description: response.data.description,
        sender_account_number: response.data.sender_account_number,
      })
      setShowReceipt(true)
      setAmount("")
      setAtmPin("")
      setTransactionPin("")
      fetchAccounts()
    } catch (err: { response?: { data?: { error?: string } } }) {
      setError(err?.response?.data?.error || "Withdrawal failed")
    } finally {
      setSending(false)
    }
  }

  const quickAmounts = [20, 50, 100, 200, 500]

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Withdrawals</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">ATM Withdrawal</h1>
        <p className="mt-1 text-slate-600">Withdraw funds from your account using your ATM card or at a branch.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Withdrawal Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Withdrawal Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setWithdrawalType("atm")}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition ${
                    withdrawalType === "atm"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  ATM Withdrawal
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawalType("counter")}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition ${
                    withdrawalType === "counter"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Banknote className="h-4 w-4" />
                  Counter Withdrawal
                </button>
              </div>
            </div>

            {/* From Account */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">From Account</label>
              <select
                value={selectedAccount?.id || ""}
                onChange={(e) => {
                  const account = accounts.find((a) => a.id === parseInt(e.target.value))
                  setSelectedAccount(account || null)
                }}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
              >
                {accounts.length === 0 && <option value="">No active accounts</option>}
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.account_number} - {account.account_type} (£{parseFloat(account.balance).toLocaleString("en-GB", { minimumFractionDigits: 2 })})
                  </option>
                ))}
              </select>
              {selectedAccount && selectedAccount.card_status === "ACTIVE" && selectedAccount.card_last_four_digits && (
                <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  Card ending in {selectedAccount.card_last_four_digits} · Daily limit £{parseFloat(selectedAccount.card_daily_limit).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                </p>
              )}
              {withdrawalType === "atm" && selectedAccount && selectedAccount.card_status !== "ACTIVE" && (
                <p className="mt-1 text-xs text-red-500">No active ATM card for this account. Use counter withdrawal or request a card.</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">£</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min={1}
                  step="0.01"
                  className="pl-8"
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {quickAmounts.map((qa) => (
                  <button
                    key={qa}
                    type="button"
                    onClick={() => setAmount(String(qa))}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    £{qa}
                  </button>
                ))}
              </div>
              {amount && parseFloat(amount) > 0 && selectedAccount && (
                <div className="mt-2 rounded-lg bg-slate-50 p-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Withdrawal amount</span>
                    <span>£{parseFloat(amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 mt-2 font-medium text-slate-900">
                    <span>Remaining balance</span>
                    <span>£{(parseFloat(selectedAccount.balance) - parseFloat(amount)).toLocaleString("en-GB", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}
            </div>

            {/* ATM PIN (only for ATM withdrawal) */}
            {withdrawalType === "atm" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  ATM PIN <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  value={atmPin}
                  onChange={(e) => setAtmPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="Enter 4-digit ATM PIN"
                  maxLength={4}
                  className="text-center text-xl tracking-widest"
                />
                <p className="mt-1 text-xs text-slate-400">The PIN you set for your ATM card</p>
              </div>
            )}

            {/* Transaction PIN */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Transaction PIN <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                value={transactionPin}
                onChange={(e) => setTransactionPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter your transaction PIN"
                maxLength={6}
                className="text-center text-xl tracking-widest"
              />
              <p className="mt-1 text-xs text-slate-400">Your 4-6 digit transaction PIN for authorization</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full rounded-lg bg-slate-950 py-3 text-white hover:bg-slate-800"
              disabled={sending || accounts.length === 0}
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Banknote className="mr-2 h-4 w-4" />
                  Withdraw Funds
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Side panel */}
        <div className="space-y-6">
          {selectedAccount && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="font-semibold text-slate-900">Account Summary</h3>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Available balance</span>
                  <span className="font-medium text-slate-900">
                    £{parseFloat(selectedAccount.balance).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Daily ATM limit</span>
                  <span className="font-medium text-slate-900">
                    £{parseFloat(selectedAccount.card_daily_limit).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {selectedAccount.card_status === "ACTIVE" && selectedAccount.card_last_four_digits && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Card</span>
                    <span className="font-mono text-xs text-slate-700">•••• {selectedAccount.card_last_four_digits}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="font-semibold text-slate-900">Withdrawal Tips</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                ATM withdrawals require your active ATM card and PIN
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                Daily ATM withdrawal limit applies per card
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                Counter withdrawals require your transaction PIN only
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                You'll receive a confirmation notification after withdrawal
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdrawal Successful</DialogTitle>
          </DialogHeader>
          {receipt && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Reference</span>
                  <span className="font-mono font-medium">{receipt.transaction_reference}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Amount</span>
                  <span className="font-medium">£{parseFloat(receipt.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Account</span>
                  <span className="font-mono">{receipt.sender_account_number}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Remaining Balance</span>
                  <span className="font-medium">£{parseFloat(receipt.balance_after).toLocaleString("en-GB", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Date</span>
                  <span>{new Date(receipt.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowReceipt(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
