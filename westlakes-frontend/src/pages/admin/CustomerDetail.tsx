/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from "react"
import { useParams, useSearchParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  ShieldCheck,
  ShieldX,
  DollarSign,
  MessageSquare,
  FileText,
  Clock,
  Snowflake,
  Lock,
  Unlock,
  Send,
  Download,
  AlertTriangle,
  UserCheck,
  KeyRound,
  ChevronDown,
  Wallet,
} from "lucide-react"
import customerService, {
  type Customer,
  type Transaction,
  type AuditLog,
  type Message,
} from "@/services/customerService"
import { StatusBadge, Skeleton, EmptyState, Modal, ConfirmModal } from "@/components/admin/AdminUI"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"

type Tab = "overview" | "transactions" | "deposits" | "messages" | "audit" | "cards"

const TABS: { key: Tab; label: string; icon: typeof FileText }[] = [
  { key: "overview", label: "Overview", icon: FileText },
  { key: "transactions", label: "Transactions", icon: CreditCard },
  { key: "deposits", label: "Deposits", icon: DollarSign },
  { key: "cards", label: "ATM Cards", icon: CreditCard },
  { key: "messages", label: "Messages", icon: MessageSquare },
  { key: "audit", label: "Audit Logs", icon: Clock },
]

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const customerId = Number(id)

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>(
    (searchParams.get("tab") as Tab) || "overview"
  )

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  const [txPage] = useState(1)

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditPage] = useState(1)
  const [, setAuditTotal] = useState(0)

  const [messages, setMessages] = useState<Message[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)

  const [depositModalOpen, setDepositModalOpen] = useState(false)
  const [depositAmount, setDepositAmount] = useState("")
  const [depositNote, setDepositNote] = useState("")
  const [depositLoading, setDepositLoading] = useState(false)

  const [messageModalOpen, setMessageModalOpen] = useState(false)
  const [messageSubject, setMessageSubject] = useState("")
  const [messageBody, setMessageBody] = useState("")
  const [messageType, setMessageType] = useState("DIRECT")
  const [messageLoading, setMessageLoading] = useState(false)

  const [confirmAction, setConfirmAction] = useState<{
    action: string
    accountId: number
    title: string
    description: string
  } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const [resetPasswordModal, setResetPasswordModal] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [resetLoading, setResetLoading] = useState(false)

  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null)
  const [showAccountDropdown, setShowAccountDropdown] = useState(false)

  const [selectedCardAccountId, setSelectedCardAccountId] = useState<number | null>(null)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [blockReason, setBlockReason] = useState("")
  const [processing, setProcessing] = useState(false)

  const fetchCustomer = useCallback(async () => {
    setLoading(true)
    try {
      const res = await customerService.getCustomer(customerId)
      setCustomer(res.data)
      if (res.data.accounts.length > 0 && !selectedAccountId) {
        setSelectedAccountId(res.data.primary_account?.id ?? res.data.accounts[0].id)
      }
    } catch {
      toast.error("Failed to load customer")
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId])

  const fetchTransactions = useCallback(async () => {
    setTransactionsLoading(true)
    try {
      const res = await customerService.getCustomerTransactions(customerId, txPage)
      setTransactions(res.data.results)
    } catch {
      toast.error("Failed to load transactions")
    } finally {
      setTransactionsLoading(false)
    }
  }, [customerId, txPage])

  const fetchAuditLogs = useCallback(async () => {
    setAuditLoading(true)
    try {
      const res = await customerService.getAuditLogs(customerId, auditPage)
      setAuditLogs(res.data.results)
      setAuditTotal(res.data.count)
    } catch {
      toast.error("Failed to load audit logs")
    } finally {
      setAuditLoading(false)
    }
  }, [customerId, auditPage])

  const fetchMessages = useCallback(async () => {
    setMessagesLoading(true)
    try {
      const res = await customerService.getMessages(customerId)
      setMessages(res.data.results)
    } catch {
      toast.error("Failed to load messages")
    } finally {
      setMessagesLoading(false)
    }
  }, [customerId])

  useEffect(() => {
    fetchCustomer()
  }, [fetchCustomer])

  useEffect(() => {
    if (activeTab === "transactions") fetchTransactions()
  }, [activeTab, fetchTransactions])

  useEffect(() => {
    if (activeTab === "audit") fetchAuditLogs()
  }, [activeTab, fetchAuditLogs])

  useEffect(() => {
    if (activeTab === "messages") fetchMessages()
  }, [activeTab, fetchMessages])

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  const handleDeposit = async () => {
    if (!viewingAccount || !depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }
    setDepositLoading(true)
    try {
      await customerService.adminDeposit({
        receiver_account_number: viewingAccount.account_number,
        amount: depositAmount,
        description: depositNote || "Admin deposit",
      })
      toast.success(`$${depositAmount} deposited successfully`)
      setDepositModalOpen(false)
      setDepositAmount("")
      setDepositNote("")
      fetchCustomer()
      if (activeTab === "transactions") fetchTransactions()
    } catch {
      toast.error("Deposit failed")
    } finally {
      setDepositLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!messageBody.trim()) {
      toast.error("Please enter a message")
      return
    }
    setMessageLoading(true)
    try {
      await customerService.sendMessage({
        recipient: customerId,
        message_type: messageType,
        subject: messageSubject,
        body: messageBody,
      })
      toast.success("Message sent")
      setMessageModalOpen(false)
      setMessageSubject("")
      setMessageBody("")
      fetchMessages()
    } catch {
      toast.error("Failed to send message")
    } finally {
      setMessageLoading(false)
    }
  }

  const handleAccountAction = async () => {
    if (!confirmAction) return
    setActionLoading(true)
    try {
      const { action, accountId } = confirmAction
      switch (action) {
        case "approve":
          await customerService.approveAccount(accountId)
          break
        case "reject":
          await customerService.rejectAccount(accountId, "Rejected by admin")
          break
        case "suspend":
          await customerService.suspendAccount(accountId, "Suspended by admin")
          break
        case "freeze":
          await customerService.freezeAccount(accountId, "Frozen by admin")
          break
        case "activate":
          await customerService.activateAccount(accountId)
          break
        case "lock":
          await customerService.lockAccount(accountId, "Locked by admin")
          break
        case "unlock":
          await customerService.unlockAccount(accountId)
          break
      }
      toast.success(`Account ${action}d successfully`)
      fetchCustomer()
    } catch {
      toast.error(`Failed to ${confirmAction.action} account`)
    } finally {
      setActionLoading(false)
      setConfirmAction(null)
    }
  }

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    setResetLoading(true)
    try {
      await customerService.resetPassword(customerId, newPassword)
      toast.success("Password reset successfully")
      setResetPasswordModal(false)
      setNewPassword("")
    } catch {
      toast.error("Failed to reset password")
    } finally {
      setResetLoading(false)
    }
  }

  const handleVerify = async () => {
    try {
      await customerService.verifyCustomer(customerId)
      toast.success("Customer verified")
      fetchCustomer()
    } catch {
      toast.error("Failed to verify customer")
    }
  }

  const handleIssueCard = async (accountId: number) => {
    setProcessing(true)
    try {
      await api.post(`/api/accounts/${accountId}/atm-card/issue/`)
      toast.success("ATM card issued successfully")
      fetchCustomer()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to issue card")
    } finally {
      setProcessing(false)
    }
  }

  const handleBlockCard = async () => {
    if (!selectedCardAccountId || !blockReason.trim()) return
    setProcessing(true)
    try {
      await api.post(`/api/accounts/${selectedCardAccountId}/atm-card/block/`, { reason: blockReason })
      toast.success("Card blocked")
      setShowBlockModal(false)
      setBlockReason("")
      setSelectedCardAccountId(null)
      fetchCustomer()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to block card")
    } finally {
      setProcessing(false)
    }
  }

  const handleUnblockCard = async (accountId: number) => {
    setProcessing(true)
    try {
      await api.post(`/api/accounts/${accountId}/atm-card/unblock/`)
      toast.success("Card unblocked")
      fetchCustomer()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to unblock card")
    } finally {
      setProcessing(false)
    }
  }

  const exportTransactionsCSV = () => {
    if (transactions.length === 0) return
    const headers = ["Date", "Reference", "Type", "Amount", "Status", "Description"]
    const rows = transactions.map((tx) => [
      new Date(tx.timestamp).toLocaleDateString(),
      tx.transaction_reference,
      tx.transaction_type,
      tx.amount,
      tx.status,
      tx.description || "",
    ])
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `customer-${customerId}-transactions.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium text-slate-900">Customer not found</p>
        <button
          onClick={() => navigate("/admin/customers")}
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          Back to customers
        </button>
      </div>
    )
  }

  const primaryAccount = customer.primary_account
  const viewingAccount = selectedAccountId
    ? customer.accounts.find((a) => a.id === selectedAccountId) || primaryAccount
    : primaryAccount

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/admin/customers")}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to customers
      </button>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-xl font-bold text-white">
              {customer.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{customer.full_name}</h1>
                {customer.is_verified ? (
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                ) : (
                  <ShieldX className="h-5 w-5 text-amber-500" />
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> {customer.email}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {customer.phone_number || "—"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CreditCard className="h-3.5 w-3.5" /> ID: {customer.national_id}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Joined{" "}
                  {new Date(customer.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {!customer.is_verified && (
              <button
                onClick={handleVerify}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
              >
                <UserCheck className="h-4 w-4" /> Verify
              </button>
            )}
            <button
              onClick={() => setDepositModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
            >
              <DollarSign className="h-4 w-4" /> Deposit
            </button>
            <button
              onClick={() => setMessageModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <MessageSquare className="h-4 w-4" /> Message
            </button>
            <button
              onClick={() => setResetPasswordModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <KeyRound className="h-4 w-4" /> Reset Password
            </button>
          </div>
        </div>
      </div>

      {customer.accounts.length > 1 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">Viewing Account</p>
          <div className="relative">
            <button
              onClick={() => setShowAccountDropdown(!showAccountDropdown)}
              className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-left text-sm transition hover:bg-slate-100"
            >
              <div className="flex items-center gap-3">
                <Wallet className="h-4 w-4 text-slate-500" />
                <div>
                  <span className="font-mono font-medium text-slate-900">
                    {customer.accounts.find((a) => a.id === selectedAccountId)?.account_number || "Select account"}
                  </span>
                  <span className="ml-2 text-slate-500">
                    ({customer.accounts.find((a) => a.id === selectedAccountId)?.account_type || "—"})
                  </span>
                </div>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition ${showAccountDropdown ? "rotate-180" : ""}`} />
            </button>
            {showAccountDropdown && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                {customer.accounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => {
                      setSelectedAccountId(account.id)
                      setShowAccountDropdown(false)
                    }}
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-slate-50 ${
                      selectedAccountId === account.id ? "bg-blue-50 text-blue-700" : "text-slate-700"
                    }`}
                  >
                    <div>
                      <span className="font-mono font-medium">{account.account_number}</span>
                      <span className="ml-2 text-slate-500">({account.account_type})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">
                        ${parseFloat(account.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                      <StatusBadge status={account.status} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Account Number</p>
          <p className="mt-1 font-mono text-lg font-semibold text-slate-900">
            {viewingAccount?.account_number || "—"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Account Type</p>
          <p className="mt-1 text-lg font-semibold capitalize text-slate-900">
            {viewingAccount?.account_type.toLowerCase() || "—"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Balance</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {viewingAccount
              ? `$${parseFloat(viewingAccount.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
              : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Status</p>
          <div className="mt-2">
            {viewingAccount ? (
              <StatusBadge status={viewingAccount.status} />
            ) : (
              <span className="text-sm text-slate-400">No account</span>
            )}
          </div>
        </div>
      </div>

      {viewingAccount && viewingAccount.status !== "PENDING" && viewingAccount.status !== "REJECTED" && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">Account Controls</p>
          <div className="flex flex-wrap gap-2">
            {viewingAccount.status === "ACTIVE" && (
              <>
                <button
                  onClick={() =>
                    setConfirmAction({
                      action: "freeze",
                      accountId: viewingAccount.id,
                      title: "Freeze Account",
                      description: `Are you sure you want to freeze ${customer.full_name}'s ${viewingAccount.account_type} account (${viewingAccount.account_number})? The customer will not be able to make transactions.`,
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                >
                  <Snowflake className="h-3.5 w-3.5" /> Freeze
                </button>
                <button
                  onClick={() =>
                    setConfirmAction({
                      action: "suspend",
                      accountId: viewingAccount.id,
                      title: "Suspend Account",
                      description: `Are you sure you want to suspend ${customer.full_name}'s ${viewingAccount.account_type} account (${viewingAccount.account_number})?`,
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-100"
                >
                  <AlertTriangle className="h-3.5 w-3.5" /> Suspend
                </button>
                <button
                  onClick={() =>
                    setConfirmAction({
                      action: "lock",
                      accountId: viewingAccount.id,
                      title: "Lock Account",
                      description: `Are you sure you want to lock ${customer.full_name}'s ${viewingAccount.account_type} account (${viewingAccount.account_number})?`,
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <Lock className="h-3.5 w-3.5" /> Lock
                </button>
              </>
            )}
            {viewingAccount.status === "FROZEN" && (
              <>
                <button
                  onClick={() =>
                    setConfirmAction({
                      action: "activate",
                      accountId: viewingAccount.id,
                      title: "Unfreeze Account",
                      description: `Reactivate ${customer.full_name}'s frozen ${viewingAccount.account_type} account (${viewingAccount.account_number})?`,
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                >
                  <Unlock className="h-3.5 w-3.5" /> Unfreeze
                </button>
                <button
                  onClick={() =>
                    setConfirmAction({
                      action: "lock",
                      accountId: viewingAccount.id,
                      title: "Lock Account",
                      description: `Lock ${customer.full_name}'s frozen ${viewingAccount.account_type} account (${viewingAccount.account_number})?`,
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <Lock className="h-3.5 w-3.5" /> Lock
                </button>
              </>
            )}
            {viewingAccount.status === "SUSPENDED" && (
              <button
                onClick={() =>
                  setConfirmAction({
                    action: "activate",
                    accountId: viewingAccount.id,
                    title: "Reactivate Account",
                    description: `Reactivate ${customer.full_name}'s suspended ${viewingAccount.account_type} account (${viewingAccount.account_number})?`,
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
              >
                <Unlock className="h-3.5 w-3.5" /> Reactivate
              </button>
            )}
            {viewingAccount.status === "LOCKED" && (
              <button
                onClick={() =>
                  setConfirmAction({
                    action: "unlock",
                    accountId: viewingAccount.id,
                    title: "Unlock Account",
                    description: `Unlock ${customer.full_name}'s ${viewingAccount.account_type} account (${viewingAccount.account_number})?`,
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
              >
                <Unlock className="h-3.5 w-3.5" /> Unlock
              </button>
            )}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex overflow-x-auto border-b border-slate-100">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-5 py-3 text-sm font-medium transition ${
                activeTab === tab.key
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-900">Personal Information</h3>
                <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                  {[
                    ["Full Name", customer.full_name],
                    ["Email", customer.email],
                    ["Phone", customer.phone_number || "—"],
                    ["National ID", customer.national_id],
                    ["Role", customer.role],
                    ["Verified", customer.is_verified ? "Yes" : "No"],
                    ["Date Joined", new Date(customer.created_at).toLocaleDateString()],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">{label}</span>
                      <span className="text-sm font-medium text-slate-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-900">Banking Information</h3>
                <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                  {[
                    ["Account Number", viewingAccount?.account_number || "—"],
                    ["Account Type", viewingAccount?.account_type || "—"],
                    [
                      "Balance",
                      viewingAccount
                        ? `$${parseFloat(viewingAccount.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                        : "—",
                    ],
                    ["Status", viewingAccount?.status || "—"],
                    ["Total Accounts", String(customer.accounts.length)],
                    [
                      "Total Balance",
                      `$${parseFloat(customer.total_balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
                    ],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">{label}</span>
                      <span className="text-sm font-medium text-slate-900">
                        {label === "Status" && viewingAccount ? (
                          <StatusBadge status={viewingAccount.status} />
                        ) : (
                          value
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                {customer.accounts.length > 1 && (
                  <div className="mt-4">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">All Accounts</h4>
                    <div className="space-y-2">
                      {customer.accounts.map((account) => (
                        <div
                          key={account.id}
                          className={`flex items-center justify-between rounded-lg border p-3 text-sm ${
                            selectedAccountId === account.id
                              ? "border-blue-200 bg-blue-50/50"
                              : "border-slate-100 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Wallet className="h-4 w-4 text-slate-400" />
                            <div>
                              <span className="font-mono text-slate-900">{account.account_number}</span>
                              <span className="ml-2 text-xs text-slate-500">{account.account_type}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-slate-900">
                              ${parseFloat(account.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </span>
                            <StatusBadge status={account.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "transactions" && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Transaction History</h3>
                <button
                  onClick={exportTransactionsCSV}
                  disabled={transactions.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </button>
              </div>
              {transactionsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <EmptyState
                  title="No transactions"
                  description="This customer has no transaction history yet"
                  icon={<CreditCard className="h-12 w-12" />}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Date
                        </th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Reference
                        </th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Type
                        </th>
                        <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Amount
                        </th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Status
                        </th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="transition hover:bg-slate-50/50">
                          <td className="px-3 py-2.5 text-sm text-slate-600">
                            {new Date(tx.timestamp).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-xs text-slate-500">
                            {tx.transaction_reference}
                          </td>
                          <td className="px-3 py-2.5 text-sm capitalize text-slate-700">
                            {tx.transaction_type.toLowerCase()}
                          </td>
                          <td className="px-3 py-2.5 text-right text-sm font-medium text-slate-900">
                            ${parseFloat(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-3 py-2.5">
                            <StatusBadge status={tx.status} />
                          </td>
                          <td className="px-3 py-2.5 text-sm text-slate-500">{tx.description || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "deposits" && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Deposit Funds</h3>
                <button
                  onClick={() => setDepositModalOpen(true)}
                  disabled={!viewingAccount}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  <DollarSign className="h-4 w-4" /> New Deposit
                </button>
              </div>
              {!viewingAccount ? (
                <EmptyState
                  title="No account available"
                  description="Customer needs an active account to receive deposits"
                />
              ) : (
                <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-xs text-slate-400">Account</p>
                      <p className="font-mono text-sm font-medium text-slate-900">
                        {viewingAccount.account_number}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Current Balance</p>
                      <p className="text-sm font-medium text-slate-900">
                        ${parseFloat(viewingAccount.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Account Status</p>
                      <StatusBadge status={viewingAccount.status} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "messages" && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Messages</h3>
                <button
                  onClick={() => setMessageModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  <Send className="h-4 w-4" /> Send Message
                </button>
              </div>
              {messagesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <EmptyState
                  title="No messages"
                  description="No communication history with this customer"
                  icon={<MessageSquare className="h-12 w-12" />}
                />
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-lg border p-4 ${
                        msg.is_read ? "border-slate-100 bg-white" : "border-blue-100 bg-blue-50/30"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-900">
                              {msg.sender_name}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                msg.message_type === "WARNING"
                                  ? "bg-red-50 text-red-600"
                                  : msg.message_type === "ANNOUNCEMENT"
                                  ? "bg-blue-50 text-blue-600"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {msg.message_type}
                            </span>
                          </div>
                          {msg.subject && (
                            <p className="mt-0.5 text-sm font-medium text-slate-700">{msg.subject}</p>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">
                          {new Date(msg.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{msg.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "audit" && (
            <div>
              <h3 className="mb-4 text-sm font-semibold text-slate-900">Audit Logs</h3>
              {auditLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : auditLogs.length === 0 ? (
                <EmptyState
                  title="No audit logs"
                  description="No admin actions recorded for this customer"
                  icon={<Clock className="h-12 w-12" />}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Timestamp
                        </th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Admin
                        </th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Action
                        </th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Previous
                        </th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          New
                        </th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="transition hover:bg-slate-50/50">
                          <td className="px-3 py-2.5 text-sm text-slate-600">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-3 py-2.5 text-sm font-medium text-slate-900">
                            {log.admin_name || "System"}
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                              {log.action_display}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 font-mono text-xs text-slate-500">
                            {log.previous_value
                              ? JSON.stringify(log.previous_value).slice(0, 40)
                              : "—"}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-xs text-slate-500">
                            {log.new_value ? JSON.stringify(log.new_value).slice(0, 40) : "—"}
                          </td>
                          <td className="px-3 py-2.5 text-sm text-slate-500">{log.notes || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "cards" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">ATM Cards</h3>
              </div>
              {customer.accounts.filter((a) => a.card_status !== "NOT_ISSUED").length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white py-8 text-center">
                  <CreditCard className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-2 text-slate-500">No ATM cards issued for this customer</p>
                  <p className="mt-1 text-xs text-slate-400">Issue a card from the table below</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customer.accounts.filter((a) => a.card_status !== "NOT_ISSUED").map((account) => {
                    const statusColors: Record<string, string> = {
                      PENDING: "bg-amber-100 text-amber-700",
                      ISSUED: "bg-blue-100 text-blue-700",
                      ACTIVE: "bg-green-100 text-green-700",
                      BLOCKED: "bg-red-100 text-red-700",
                      EXPIRED: "bg-orange-100 text-orange-700",
                    }
                    return (
                      <div key={account.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-mono text-sm font-medium text-slate-900">
                                {account.card_number
                                  ? `•••• •••• •••• ${account.card_number.slice(-4)}`
                                  : "No card number"}
                              </p>
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[account.card_status ?? ""] || "bg-slate-100 text-slate-600"}`}>
                                {account.card_status_display}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                              Account: {account.account_number} ({account.account_type})
                            </p>
                            {account.card_expiry && (
                              <p className="mt-0.5 text-xs text-slate-400">
                                Expires: {new Date(account.card_expiry).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                              </p>
                            )}
                            {account.card_status === "BLOCKED" && account.card_blocked_reason && (
                              <p className="mt-1 text-xs text-red-500">Reason: {account.card_blocked_reason}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {account.card_status === "ACTIVE" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => {
                                      setSelectedCardAccountId(account.id)
                                      setBlockReason("")
                                      setShowBlockModal(true)
                                    }}
                                  >
                                    <Lock className="mr-1 h-3.5 w-3.5" />
                                    Block
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">Block this card</TooltipContent>
                              </Tooltip>
                            )}
                            {account.card_status === "BLOCKED" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 border-green-200 hover:bg-green-50"
                                    onClick={() => handleUnblockCard(account.id)}
                                  >
                                    <Unlock className="mr-1 h-3.5 w-3.5" />
                                    Unblock
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">Unblock this card</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Issue card section for accounts without cards */}
              {customer.accounts.filter((a) => a.card_status === "NOT_ISSUED").length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                  <p className="text-sm font-medium text-amber-800 mb-3">Accounts without cards</p>
                  <div className="space-y-2">
                    {customer.accounts.filter((a) => a.card_status === "NOT_ISSUED").map((account) => (
                      <div key={account.id} className="flex items-center justify-between rounded-lg bg-white border border-amber-200 px-4 py-2.5">
                        <div>
                          <p className="font-mono text-sm text-slate-900">{account.account_number}</p>
                          <p className="text-xs text-slate-500">{account.account_type} · £{parseFloat(account.balance).toLocaleString("en-GB", { minimumFractionDigits: 2 })}</p>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => handleIssueCard(account.id)}
                              disabled={processing}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                              Issue Card
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">Issue ATM card for this account</TooltipContent>
                        </Tooltip>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        title="Deposit Funds"
        description={`Add funds to ${customer.full_name}'s account`}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Account</label>
            <p className="font-mono text-sm text-slate-900">
              {viewingAccount?.account_number || "No account"}
            </p>
            {viewingAccount && (
              <p className="mt-1 text-xs text-slate-500">
                {viewingAccount.account_type} — Balance: ${parseFloat(viewingAccount.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Amount ($)</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="0.00"
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Notes (optional)</label>
            <textarea
              value={depositNote}
              onChange={(e) => setDepositNote(e.target.value)}
              placeholder="Transaction reference or notes..."
              rows={2}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDepositModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeposit}
              disabled={depositLoading || !depositAmount}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {depositLoading ? "Processing..." : "Deposit"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={messageModalOpen}
        onClose={() => setMessageModalOpen(false)}
        title="Send Message"
        description={`Send a message to ${customer.full_name}`}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Message Type</label>
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
            >
              <option value="DIRECT">Direct Message</option>
              <option value="ANNOUNCEMENT">Announcement</option>
              <option value="WARNING">Warning</option>
              <option value="INFO">Information</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Subject</label>
            <input
              type="text"
              value={messageSubject}
              onChange={(e) => setMessageSubject(e.target.value)}
              placeholder="Message subject..."
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Message</label>
            <textarea
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              placeholder="Type your message..."
              rows={4}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setMessageModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSendMessage}
              disabled={messageLoading || !messageBody.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              {messageLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={resetPasswordModal}
        onClose={() => setResetPasswordModal(false)}
        title="Reset Password"
        description={`Set a new password for ${customer.full_name}`}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setResetPasswordModal(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleResetPassword}
              disabled={resetLoading || !newPassword || newPassword.length < 8}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {resetLoading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </div>
      </Modal>

      {confirmAction && (
        <ConfirmModal
          open={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={handleAccountAction}
          title={confirmAction.title}
          description={confirmAction.description}
          confirmLabel="Confirm"
          variant="warning"
          loading={actionLoading}
        />
      )}

      <Modal
        open={showBlockModal}
        onClose={() => { setShowBlockModal(false); setBlockReason("") }}
        title="Block ATM Card"
        description="Block the ATM card for this account? The customer will not be able to use this card for ATM withdrawals."
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Reason for blocking <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="e.g., Suspected fraud, Lost card, Customer request..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setShowBlockModal(false); setBlockReason("") }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBlockCard}
              disabled={processing || !blockReason.trim()}
            >
              {processing ? "Blocking..." : "Block Card"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
