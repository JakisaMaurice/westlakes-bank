import { useEffect, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { api } from "@/lib/api"
import { Search, CheckCircle, XCircle, Loader2 } from "lucide-react"

interface ApprovalRequest {
  id: number
  user_name: string
  account_type: string
  status: string
  account_number: string
}

export default function AccountApprovals() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<ApprovalRequest | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [processing, setProcessing] = useState(false)

  const fetchApprovals = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      const response = await api.get<ApprovalRequest[]>(`/api/accounts/?${params.toString()}`)
      setRequests(response.data.filter((item) => item.status === "PENDING_VERIFICATION"))
    } catch {
      setError("Unable to load approvals.")
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchApprovals()
  }, [fetchApprovals])

  const approveAccount = async (id: number) => {
    try {
      await api.post(`/api/accounts/${id}/approve/`)
      setRequests((current) => current.filter((item) => item.id !== id))
    } catch (err: any) {
      setError(err.response?.data?.error || "Unable to approve account.")
    }
  }

  const handleReject = async () => {
    if (!selectedAccount) return
    setProcessing(true)
    try {
      await api.post(`/api/accounts/${selectedAccount.id}/reject/`, {
        reason: rejectReason,
      })
      setRequests((current) => current.filter((item) => item.id !== selectedAccount.id))
      setRejectModalOpen(false)
      setSelectedAccount(null)
      setRejectReason("")
    } catch (err: any) {
      setError(err.response?.data?.error || "Unable to reject account.")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Approvals</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Account Approvals</h1>
        <p className="mt-1 text-slate-600">Review and approve pending account applications</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search by customer name or account number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center">
          <p className="text-slate-500">No pending account approvals</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Account Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{request.user_name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-mono text-sm text-slate-600">{request.account_number}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                      {request.account_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveAccount(request.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedAccount(request)
                          setRejectModalOpen(true)
                        }}
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to reject this account application?
            </p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Reason
              </label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Provide a reason for rejection..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing}
            >
              {processing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
