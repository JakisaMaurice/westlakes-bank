import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import kycService, { DOCUMENT_TYPES, type KYCVerification, type UploadedDocument } from "@/services/kycService"
import { useAuth } from "@/lib/useAuth"
import {
  Upload, X, CheckCircle, AlertCircle, FileText, Image, Loader2,
  ShieldCheck, FileCheck, CreditCard, ArrowRight
} from "lucide-react"

interface DocumentUploadState {
  documentType: string
  file: File | null
  uploading: boolean
  progress: number
  uploaded: UploadedDocument | null
  error: string | null
}

const steps = [
  { id: 1, title: "Identity Document", description: "Upload your National ID or Passport", icon: FileCheck },
  { id: 2, title: "Passport Photo", description: "Upload a clear selfie or passport photo", icon: Image },
  { id: 3, title: "Proof of Address", description: "Upload a utility bill or bank statement", icon: FileText },
  { id: 4, title: "Signature", description: "Upload an image of your signature", icon: CreditCard },
]

export default function KYCVerification() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [kyc, setKyc] = useState<KYCVerification | null>(null)
  const [documents, setDocuments] = useState<DocumentUploadState[]>(
    DOCUMENT_TYPES.map((dt) => ({
      documentType: dt.value,
      file: null,
      uploading: false,
      progress: 0,
      uploaded: null,
      error: null,
    }))
  )
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchKYC = useCallback(async () => {
    try {
      const res = await kycService.getMyKYC()
      setKyc(res.data)

      if (res.data.documents && res.data.documents.length > 0) {
        setDocuments((prev) =>
          prev.map((doc) => {
            const existing = res.data.documents.find(
              (d: UploadedDocument) => d.document_type === doc.documentType
            )
            if (existing) {
              return { ...doc, uploaded: existing, progress: 100 }
            }
            return doc
          })
        )
      }

      if (res.data.status === "APPROVED") {
        navigate("/dashboard", { replace: true })
      }
    } catch {
      // KYC record might not exist yet
    } finally {
      setLoading(false)
    }
  }, [navigate])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchKYC()
  }, [fetchKYC])
  /* eslint-enable react-hooks/set-state-in-effect */

  const getDocumentState = (type: string) => documents.find((d) => d.documentType === type)

  const updateDocumentState = (type: string, updates: Partial<DocumentUploadState>) => {
    setDocuments((prev) =>
      prev.map((d) => (d.documentType === type ? { ...d, ...updates } : d))
    )
  }

  const handleFileSelect = useCallback((documentType: string, file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      updateDocumentState(documentType, { error: "Only JPG, PNG, and PDF files are allowed" })
      return
    }
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      updateDocumentState(documentType, { error: "File size must be less than 10MB" })
      return
    }
    updateDocumentState(documentType, { file, error: null })
  }, [])

  const handleUpload = async (documentType: string) => {
    const docState = getDocumentState(documentType)
    if (!docState?.file) return

    updateDocumentState(documentType, { uploading: true, progress: 0, error: null })

    try {
      const response = await kycService.uploadDocument(documentType, docState.file, (progress) => {
        updateDocumentState(documentType, { progress })
      })
      updateDocumentState(documentType, {
        uploading: false,
        uploaded: response.data,
        file: null,
        progress: 100,
      })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      updateDocumentState(documentType, {
        uploading: false,
        error: error.response?.data?.error || "Upload failed",
      })
    }
  }

  const handleDelete = async (documentType: string) => {
    const docState = getDocumentState(documentType)
    if (!docState?.uploaded) return

    try {
      await kycService.deleteDocument(docState.uploaded.id)
      updateDocumentState(documentType, { uploaded: null, progress: 0 })
    } catch {
      updateDocumentState(documentType, { error: "Failed to delete document" })
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      await kycService.submitKYC()
      navigate("/dashboard", { replace: true })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      setSubmitError(error.response?.data?.error || "Failed to submit KYC")
    } finally {
      setSubmitting(false)
    }
  }

  const requiredDocs = DOCUMENT_TYPES.filter((d) => d.required)
  const requiredUploaded = requiredDocs.filter((d) => getDocumentState(d.value)?.uploaded).length
  const allRequiredUploaded = requiredUploaded === requiredDocs.length
  const totalDocs = DOCUMENT_TYPES.length
  const totalUploaded = DOCUMENT_TYPES.filter((d) => getDocumentState(d.value)?.uploaded).length

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
          <ShieldCheck className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Verify Your Identity</h1>
        <p className="mt-2 text-slate-600">
          Welcome{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}! To activate your account and start banking,
          we need to verify your identity. Please upload the required documents below.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Document Progress</h2>
            <p className="text-sm text-slate-500">
              {totalUploaded} of {totalDocs} documents uploaded
            </p>
          </div>
          <span className="text-2xl font-bold text-blue-600">
            {Math.round((totalUploaded / totalDocs) * 100)}%
          </span>
        </div>
        <div className="mt-3 h-3 w-full rounded-full bg-slate-100">
          <div
            className="h-3 rounded-full bg-blue-600 transition-all"
            style={{ width: `${(totalUploaded / totalDocs) * 100}%` }}
          />
        </div>
      </div>

      {kyc?.status === "REJECTED" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800">Previous Submission Rejected</h4>
              <p className="mt-1 text-sm text-red-700">{kyc.rejection_reason}</p>
              <p className="mt-2 text-sm text-red-600">Please correct the issues and resubmit your documents.</p>
            </div>
          </div>
        </div>
      )}

      {(kyc?.status === "PENDING_REVIEW" || kyc?.status === "UNDER_VERIFICATION") && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-start gap-3">
            <Loader2 className="h-5 w-5 text-blue-600 mt-0.5 animate-spin" />
            <div>
              <h4 className="font-semibold text-blue-800">Verification In Progress</h4>
              <p className="mt-1 text-sm text-blue-700">
                Your documents are being reviewed by our team. You will be notified once the review is complete.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {DOCUMENT_TYPES.map((docType, index) => {
          const state = getDocumentState(docType.value)
          const isUploaded = !!state?.uploaded
          const step = steps[index]

          return (
            <Card
              key={docType.value}
              className={`rounded-2xl border transition ${
                isUploaded
                  ? "border-green-200 bg-green-50/50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                      isUploaded ? "bg-green-100" : "bg-slate-100"
                    }`}
                  >
                    {isUploaded ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : step ? (
                      <step.icon className="h-6 w-6 text-slate-400" />
                    ) : (
                      <Upload className="h-6 w-6 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{docType.label}</h3>
                      {docType.required && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                          REQUIRED
                        </span>
                      )}
                      {!docType.required && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                          OPTIONAL
                        </span>
                      )}
                    </div>
                    {step && (
                      <p className="mt-0.5 text-sm text-slate-500">{step.description}</p>
                    )}

                    {isUploaded ? (
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex items-center gap-2 rounded-lg bg-green-100 px-3 py-1.5">
                          <FileText className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700 truncate max-w-[200px]">
                            {state.uploaded?.original_filename}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDelete(docType.value)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3">
                        {state?.uploading ? (
                          <div className="space-y-2">
                            <div className="h-2 w-full rounded-full bg-slate-100">
                              <div
                                className="h-2 rounded-full bg-blue-600 transition-all"
                                style={{ width: `${state.progress}%` }}
                              />
                            </div>
                            <p className="text-sm text-slate-500">Uploading... {state.progress}%</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 p-6 transition hover:border-blue-400 hover:bg-blue-50/30">
                              <Upload className="h-5 w-5 text-slate-400" />
                              <span className="text-sm text-slate-500">
                                Click to browse or drag and drop
                              </span>
                              <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) handleFileSelect(docType.value, file)
                                }}
                              />
                            </label>
                            {state?.file && (
                              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                                <div className="flex items-center gap-2 min-w-0">
                                  <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                                  <span className="text-sm text-slate-700 truncate">{state.file.name}</span>
                                  <span className="text-xs text-slate-400">
                                    ({(state.file.size / 1024 / 1024).toFixed(1)} MB)
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleUpload(docType.value)}
                                  className="bg-blue-600 hover:bg-blue-700 shrink-0"
                                >
                                  Upload
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                        {state?.error && (
                          <p className="mt-2 text-sm text-red-600">{state.error}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Ready to submit?</h3>
            <p className="text-sm text-slate-500">
              {allRequiredUploaded
                ? "All required documents uploaded. Submit for review."
                : `${requiredUploaded} of ${requiredDocs.length} required documents uploaded`}
            </p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!allRequiredUploaded || submitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit for Review
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
        {submitError && <p className="mt-3 text-sm text-red-600">{submitError}</p>}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h3 className="font-semibold text-slate-900">What happens next?</h3>
        <div className="mt-4 space-y-3">
          {[
            "Our team will review your documents within 1-2 business days",
            "You will receive an email notification once your verification is complete",
            "If any documents need correction, we will let you know the specific issues",
            "Once approved, your account will be fully activated",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                {i + 1}
              </div>
              <p className="text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
