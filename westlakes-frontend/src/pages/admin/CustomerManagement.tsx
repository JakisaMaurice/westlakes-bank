/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  Eye,
  CheckCircle,
  XCircle,
  Snowflake,
  Lock,
  Unlock,
  DollarSign,
  MessageSquare,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users,
} from "lucide-react"
import customerService, { type Customer } from "@/services/customerService"
import { StatusBadge, TableSkeleton, EmptyState, Pagination } from "@/components/admin/AdminUI"
import { toast } from "sonner"

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "REJECTED", label: "Rejected" },
  { value: "FROZEN", label: "Frozen" },
  { value: "LOCKED", label: "Locked" },
]

const ACCOUNT_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "SAVINGS", label: "Savings" },
  { value: "CURRENT", label: "Current" },
  { value: "BUSINESS", label: "Business" },
]

type SortField = "full_name" | "email" | "created_at"

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: "asc" | "desc" }) {
  if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
  return sortDir === "asc" ? (
    <ArrowUp className="h-3.5 w-3.5 text-slate-700" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5 text-slate-700" />
  )
}

export default function CustomerManagement() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [accountTypeFilter, setAccountTypeFilter] = useState("")
  const [sortField, setSortField] = useState<SortField>("created_at")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)

  const pageSize = 20
  const totalPages = Math.ceil(totalItems / pageSize)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const ordering = sortDir === "asc" ? sortField : `-${sortField}`
      const res = await customerService.getCustomers({
        search: search || undefined,
        status: statusFilter || undefined,
        account_type: accountTypeFilter || undefined,
        ordering,
        page: currentPage,
        page_size: pageSize,
      })
      setCustomers(res.data.results)
      setTotalItems(res.data.count)
    } catch {
      toast.error("Failed to load customers")
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, accountTypeFilter, sortField, sortDir, currentPage])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  useEffect(() => {
    const handleClick = () => setOpenDropdown(null)
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setCurrentPage(1)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDir("asc")
    }
    setCurrentPage(1)
  }

  const handleAction = async (action: string, accountId: number, customerName: string) => {
    const key = `${action}-${accountId}`
    setActionLoading((prev) => ({ ...prev, [key]: true }))
    setOpenDropdown(null)

    try {
      switch (action) {
        case "approve": {
          await customerService.approveAccount(accountId)
          toast.success(`Account approved for ${customerName}`)
          break
        }
        case "reject": {
          const reason = prompt("Enter rejection reason:")
          if (!reason) return
          await customerService.rejectAccount(accountId, reason)
          toast.success(`Account rejected for ${customerName}`)
          break
        }
        case "suspend": {
          const suspendReason = prompt("Enter suspension reason:")
          if (!suspendReason) return
          await customerService.suspendAccount(accountId, suspendReason)
          toast.success(`Account suspended for ${customerName}`)
          break
        }
        case "freeze": {
          const freezeReason = prompt("Enter freeze reason:")
          if (!freezeReason) return
          await customerService.freezeAccount(accountId, freezeReason)
          toast.success(`Account frozen for ${customerName}`)
          break
        }
        case "activate": {
          await customerService.activateAccount(accountId)
          toast.success(`Account activated for ${customerName}`)
          break
        }
        case "lock": {
          const lockReason = prompt("Enter lock reason:")
          if (!lockReason) return
          await customerService.lockAccount(accountId, lockReason)
          toast.success(`Account locked for ${customerName}`)
          break
        }
        case "unlock": {
          await customerService.unlockAccount(accountId)
          toast.success(`Account unlocked for ${customerName}`)
          break
        }
      }
      fetchCustomers()
    } catch {
      toast.error(`Failed to ${action} account`)
    } finally {
      setActionLoading((prev) => ({ ...prev, [key]: false }))
    }
  }

  const getAccountStatus = (customer: Customer) => {
    if (customer.accounts.length === 0) return "NO ACCOUNT"
    return customer.accounts[0].status
  }

  const getAccountNumber = (customer: Customer) => {
    if (customer.accounts.length === 0) return "—"
    return customer.accounts[0].account_number
  }

  const getAccountType = (customer: Customer) => {
    if (customer.accounts.length === 0) return "—"
    return customer.accounts[0].account_type
  }

  const getBalance = (customer: Customer) => {
    if (customer.accounts.length === 0) return "—"
    return `$${parseFloat(customer.accounts[0].balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-700" />
            <h1 className="text-2xl font-bold text-slate-900">Customer Management</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Manage customer accounts, approvals, and transactions
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="font-semibold text-slate-900">{totalItems}</span> total customers
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, email, phone, account..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
            />
          </form>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={accountTypeFilter}
              onChange={(e) => {
                setAccountTypeFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
            >
              {ACCOUNT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={5} cols={8} />
        ) : customers.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No customers found"
              description="Try adjusting your search or filter criteria"
              icon={<Users className="h-12 w-12" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("full_name")}
                      className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-700"
                    >
                      Customer <SortIcon field="full_name" sortField={sortField} sortDir={sortDir} />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Account
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Type
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Balance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("created_at")}
                      className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-700"
                    >
                       Joined <SortIcon field="created_at" sortField={sortField} sortDir={sortDir} />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((customer) => (
                  <tr key={customer.id} className="transition hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                          {customer.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{customer.full_name}</p>
                          <div className="flex items-center gap-1.5">
                            {customer.is_verified ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-600">
                                <CheckCircle className="h-3 w-3" /> Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-600">
                                <XCircle className="h-3 w-3" /> Unverified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">{customer.email}</p>
                      <p className="text-xs text-slate-400">{customer.phone_number || "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-slate-700">{getAccountNumber(customer)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm capitalize text-slate-600">{getAccountType(customer).toLowerCase()}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium text-slate-900">{getBalance(customer)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={getAccountStatus(customer)} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-500">
                        {new Date(customer.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenDropdown(openDropdown === customer.id ? null : customer.id)
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                        >
                          Actions <ChevronDown className="h-3 w-3" />
                        </button>
                        {openDropdown === customer.id && (
                          <div
                            className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => navigate(`/admin/customers/${customer.id}`)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <Eye className="h-3.5 w-3.5" /> View Details
                            </button>
                            {customer.accounts.length > 0 && (
                              <>
                                {customer.accounts[0].status === "PENDING" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleAction("approve", customer.accounts[0].id, customer.full_name)
                                      }
                                      disabled={actionLoading[`approve-${customer.accounts[0].id}`]}
                                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                                    >
                                      <CheckCircle className="h-3.5 w-3.5" /> Approve
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleAction("reject", customer.accounts[0].id, customer.full_name)
                                      }
                                      disabled={actionLoading[`reject-${customer.accounts[0].id}`]}
                                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                                    >
                                      <XCircle className="h-3.5 w-3.5" /> Reject
                                    </button>
                                  </>
                                )}
                                {customer.accounts[0].status === "ACTIVE" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleAction("freeze", customer.accounts[0].id, customer.full_name)
                                      }
                                      disabled={actionLoading[`freeze-${customer.accounts[0].id}`]}
                                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                                    >
                                      <Snowflake className="h-3.5 w-3.5" /> Freeze
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleAction("suspend", customer.accounts[0].id, customer.full_name)
                                      }
                                      disabled={actionLoading[`suspend-${customer.accounts[0].id}`]}
                                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                                    >
                                      <Lock className="h-3.5 w-3.5" /> Suspend
                                    </button>
                                  </>
                                )}
                                {(customer.accounts[0].status === "SUSPENDED" ||
                                  customer.accounts[0].status === "FROZEN" ||
                                  customer.accounts[0].status === "LOCKED") && (
                                  <button
                                    onClick={() =>
                                      handleAction("activate", customer.accounts[0].id, customer.full_name)
                                    }
                                    disabled={actionLoading[`activate-${customer.accounts[0].id}`]}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                                  >
                                    <Unlock className="h-3.5 w-3.5" /> Reactivate
                                  </button>
                                )}
                              </>
                            )}
                            <div className="my-1 border-t border-slate-100" />
                            <button
                              onClick={() => navigate(`/admin/customers/${customer.id}?tab=deposit`)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <DollarSign className="h-3.5 w-3.5" /> Deposit Funds
                            </button>
                            <button
                              onClick={() => navigate(`/admin/customers/${customer.id}?tab=messages`)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <MessageSquare className="h-3.5 w-3.5" /> Send Message
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && customers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            pageSize={pageSize}
          />
        )}
      </div>
    </div>
  )
}
