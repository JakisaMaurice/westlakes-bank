import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import customerService, { type Customer } from "@/services/customerService"
import {
  Search,
  Eye,
  Lock,
  Unlock,
  Snowflake,
  Ban,
  Key,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const statusConfig: Record<string, { color: string; label: string }> = {
  PENDING_VERIFICATION: { color: "bg-amber-100 text-amber-700", label: "Pending" },
  ACTIVE: { color: "bg-green-100 text-green-700", label: "Active" },
  SUSPENDED: { color: "bg-orange-100 text-orange-700", label: "Suspended" },
  FROZEN: { color: "bg-blue-100 text-blue-700", label: "Frozen" },
  LOCKED: { color: "bg-red-100 text-red-700", label: "Locked" },
  REJECTED: { color: "bg-red-100 text-red-700", label: "Rejected" },
}

export default function CustomerManagement() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState<"suspend" | "freeze" | "lock" | "reset-password">("suspend")
  const [actionReason, setActionReason] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [processing, setProcessing] = useState(false)

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const response = await customerService.getCustomers({
        search: search || undefined,
        status: statusFilter || undefined,
        page,
      })
      setCustomers(response.data.results)
      setTotalPages(Math.ceil(response.data.count / 20))
    } catch (err) {
      console.error("Failed to fetch customers:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [search, statusFilter, page])

  const handleAction = async () => {
    if (!selectedCustomer) return
    setProcessing(true)

    try {
      const account = selectedCustomer.accounts[0]
      if (!account) throw new Error("No account found")

      switch (actionType) {
        case "suspend":
          await customerService.suspendAccount(account.id, actionReason)
          break
        case "freeze":
          await customerService.freezeAccount(account.id, actionReason)
          break
        case "lock":
          await customerService.lockAccount(account.id, actionReason)
          break
        case "reset-password":
          await customerService.resetPassword(selectedCustomer.id, newPassword)
          break
      }

      setShowActionModal(false)
      setActionReason("")
      setNewPassword("")
      fetchCustomers()
    } catch (err: any) {
      console.error("Action failed:", err)
    } finally {
      setProcessing(false)
    }
  }

  const openActionModal = (customer: Customer, type: typeof actionType) => {
    setSelectedCustomer(customer)
    setActionType(type)
    setShowActionModal(true)
  }

  const getActionModalContent = () => {
    switch (actionType) {
      case "suspend":
        return {
          title: "Suspend Account",
          description: "This will temporarily suspend the customer's account. They will not be able to make transactions.",
          buttonText: "Suspend",
          buttonColor: "bg-orange-600 hover:bg-orange-700",
          icon: Ban,
        }
      case "freeze":
        return {
          title: "Freeze Account",
          description: "This will freeze the customer's account. All transactions will be blocked.",
          buttonText: "Freeze",
          buttonColor: "bg-blue-600 hover:bg-blue-700",
          icon: Snowflake,
        }
      case "lock":
        return {
          title: "Lock Account",
          description: "This will lock the customer's account and prevent login access.",
          buttonText: "Lock",
          buttonColor: "bg-red-600 hover:bg-red-700",
          icon: Lock,
        }
      case "reset-password":
        return {
          title: "Reset Password",
          description: "This will reset the customer's password. They will need to use the new password to login.",
          buttonText: "Reset Password",
          buttonColor: "bg-slate-600 hover:bg-slate-700",
          icon: Key,
        }
    }
  }

  const modalContent = getActionModalContent()
  const ModalIcon = modalContent.icon

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Customer Management</h1>
        <p className="mt-1 text-slate-600">Manage customer accounts and access</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name, email, phone, or account number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="PENDING_VERIFICATION">Pending Verification</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="FROZEN">Frozen</option>
          <option value="LOCKED">Locked</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    KYC
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {customers.map((customer) => {
                  const account = customer.accounts[0]
                  const status = account
                    ? statusConfig[account.status] || statusConfig.PENDING_VERIFICATION
                    : statusConfig.PENDING_VERIFICATION
                  const kycStatus = customer.kyc_status || "Not Started"

                  return (
                    <tr key={customer.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{customer.full_name}</p>
                          <p className="text-sm text-slate-500">{customer.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {account ? (
                          <div>
                            <p className="font-mono text-sm text-slate-900">{account.account_number}</p>
                            <p className="text-xs text-slate-500">{account.account_type}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">No account</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">
                          £{parseFloat(customer.total_balance || "0").toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{kycStatus}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/customers/${customer.id}`)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {account?.status === "ACTIVE" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openActionModal(customer, "suspend")}
                                className="text-orange-600 hover:text-orange-700"
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openActionModal(customer, "freeze")}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Snowflake className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openActionModal(customer, "lock")}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Lock className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {(account?.status === "SUSPENDED" || account?.status === "FROZEN" || account?.status === "LOCKED") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                await customerService.activateAccount(account.id)
                                fetchCustomers()
                              }}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Unlock className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openActionModal(customer, "reset-password")}
                            className="text-slate-600 hover:text-slate-700"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {customers.length === 0 && (
              <div className="py-12 text-center text-slate-500">No customers found</div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Action Modal */}
      <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalContent.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">{modalContent.description}</p>
            {actionType === "reset-password" ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  New Password
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  minLength={8}
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Reason (optional)
                </label>
                <Textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Provide a reason for this action..."
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={processing || (actionType === "reset-password" && newPassword.length < 8)}
              className={modalContent.buttonColor}
            >
              {processing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ModalIcon className="mr-2 h-4 w-4" />
              )}
              {modalContent.buttonText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
