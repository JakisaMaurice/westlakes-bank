import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import kycService, { type KYCVerification } from "@/services/kycService"
import { Search, Eye, CheckCircle, XCircle, AlertTriangle, Loader2, FileText, Image } from "lucide-react"

const statusConfig: Record<string, { color: string; label: string }> = {
  PENDING_VERIFICATION: { color: "bg-amber-100 text-amber-700", label: "Pending Verification" },
  PENDING_REVIEW: { color: "bg-blue-100 text-blue-700", label: "Pending Review" },
  UNDER_VERIFICATION: { color: "bg-purple-100 text-purple-700", label: "Under Verification" },
  APPROVED: { color: "bg-green-100 text-green-700", label: "Approved" },
  REJECTED: { color: "bg-red-100 text-red-700", label: "Rejected" },
}

export default function AdminVerificationManagement() {
  const [verifications, setVerifications] = useState<KYCVerification[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [selectedKYC, setSelectedKYC] = useState<KYCVerification | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [processing, setProcessing] = useState(false)

  const fetchVerifications = async () => {
    setLoading(true)
    try {
      const response = await kycService.getAdminVerifications({
        search: search || undefined,
        status: statusFilter || undefined,
      })
      setVerifications(response.data.results)
    } catch (err) {
      console.error("Failed to fetch verifications:", err)
    } finally {
      setLoading(false)
    }
  }

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    fetchVerifications()
  }, [search, statusFilter])
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const handleApprove = async () => {
    if (!selectedKYC) return
    setProcessing(true)
    try {
      await kycService.approveKYC(selectedKYC.id, adminNotes)
      setShowApproveModal(false)
      setAdminNotes("")
      fetchVerifications()
    } catch (err) {
      console.error("Failed to approve KYC:", err)
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedKYC || !rejectionReason) return
    setProcessing(true)
    try {
      await kycService.rejectKYC(selectedKYC.id, rejectionReason, adminNotes)
      setShowRejectModal(false)
      setRejectionReason("")
      setAdminNotes("")
      fetchVerifications()
    } catch (err) {
      console.error("Failed to reject KYC:", err)
    } finally {
      setProcessing(false)
    }
  }

  const handleRequestChanges = async () => {
    if (!selectedKYC || !rejectionReason) return
    setProcessing(true)
    try {
      await kycService.requestChanges(selectedKYC.id, rejectionReason, adminNotes)
      setShowRejectModal(false)
      setRejectionReason("")
      setAdminNotes("")
      fetchVerifications()
    } catch (err) {
      console.error("Failed to request changes:", err)
    } finally {
      setProcessing(false)
    }
  }

  const openDetail = async (kyc: KYCVerification) => {
    try {
      const response = await kycService.getAdminVerificationDetail(kyc.id)
      setSelectedKYC(response.data)
      setShowDetailModal(true)
    } catch (err) {
      console.error("Failed to fetch KYC detail:", err)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Verification Management</h1>
        <p className="mt-1 text-slate-600">Review and approve customer KYC documents</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name or email..."
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
          <option value="PENDING_REVIEW">Pending Review</option>
          <option value="UNDER_VERIFICATION">Under Verification</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
                  Documents
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Submitted
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {verifications.map((kyc) => {
                const status = statusConfig[kyc.status] || statusConfig.PENDING_VERIFICATION
                return (
                  <tr key={kyc.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{kyc.user_name}</p>
                        <p className="text-sm text-slate-500">{kyc.user_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600">
                          {kyc.documents.length} documents
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={status.color}>{status.label}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {kyc.submitted_at
                        ? new Date(kyc.submitted_at).toLocaleDateString()
                        : "Not submitted"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDetail(kyc)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        View
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {verifications.length === 0 && (
            <div className="py-12 text-center text-slate-500">No verifications found</div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>KYC Verification Details</DialogTitle>
          </DialogHeader>
          {selectedKYC && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Customer Name</p>
                  <p className="font-medium">{selectedKYC.user_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium">{selectedKYC.user_email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <Badge className={statusConfig[selectedKYC.status]?.color}>
                    {selectedKYC.status_display}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Submitted</p>
                  <p className="font-medium">
                    {selectedKYC.submitted_at
                      ? new Date(selectedKYC.submitted_at).toLocaleString()
                      : "Not submitted"}
                  </p>
                </div>
              </div>

              {selectedKYC.rejection_reason && (
                <div className="rounded-lg bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-800">Rejection Reason</p>
                  <p className="mt-1 text-sm text-red-700">{selectedKYC.rejection_reason}</p>
                </div>
              )}

              <div>
                <h4 className="mb-3 font-medium text-slate-900">Uploaded Documents ({selectedKYC.documents.length})</h4>
                <div className="space-y-2">
                  {selectedKYC.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 hover:bg-slate-50 transition"
                    >
                      {doc.mime_type.startsWith("image/") ? (
                        <Image className="h-5 w-5 text-blue-500 shrink-0" />
                      ) : (
                        <FileText className="h-5 w-5 text-red-500 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {doc.document_type_display}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {doc.original_filename} · {(doc.file_size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                      {doc.file_url && (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </a>
                      )}
                    </div>
                  ))}
                  {selectedKYC.documents.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">No documents uploaded yet</p>
                  )}
                </div>
              </div>

              {["PENDING_VERIFICATION", "PENDING_REVIEW", "UNDER_VERIFICATION"].includes(selectedKYC.status) && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowDetailModal(false)
                      setShowApproveModal(true)
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setShowDetailModal(false)
                      setShowRejectModal(true)
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject / Request Changes
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Modal */}
      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Verification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to approve this customer's verification? This will activate their account.
            </p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Admin Notes (optional)
              </label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject / Request Changes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Reason <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain what needs to be corrected..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Admin Notes (optional)
              </label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={handleRequestChanges}
              disabled={!rejectionReason || processing}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Request Changes
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason || processing}
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
