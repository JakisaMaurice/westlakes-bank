import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import kycService, { DOCUMENT_TYPES, type KYCVerification, type UploadedDocument } from "@/services/kycService"
import { Upload, X, CheckCircle, AlertCircle, FileText, Image, Loader2 } from "lucide-react"

interface DocumentUploadState {
  documentType: string
  file: File | null
  uploading: boolean
  progress: number
  uploaded: UploadedDocument | null
  error: string | null
}

interface KYCUploadProps {
  kyc: KYCVerification | null
  onUpdate: () => void
}

export default function KYCUpload({ kyc, onUpdate }: KYCUploadProps) {
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

  const getDocumentState = (type: string) => {
    return documents.find((d) => d.documentType === type)
  }

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
    } catch (err: any) {
      updateDocumentState(documentType, {
        uploading: false,
        error: err.response?.data?.error || "Upload failed",
      })
    }
  }

  const handleDelete = async (documentType: string) => {
    const docState = getDocumentState(documentType)
    if (!docState?.uploaded) return

    try {
      await kycService.deleteDocument(docState.uploaded.id)
      updateDocumentState(documentType, { uploaded: null, progress: 0 })
    } catch (err: any) {
      updateDocumentState(documentType, { error: "Failed to delete document" })
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError(null)

    try {
      await kycService.submitKYC([])
      onUpdate()
    } catch (err: any) {
      setSubmitError(err.response?.data?.error || "Failed to submit KYC")
    } finally {
      setSubmitting(false)
    }
  }

  const requiredDocs = DOCUMENT_TYPES.filter((d) => d.required)
  const requiredUploaded = requiredDocs.filter((d) => getDocumentState(d.value)?.uploaded).length
  const allRequiredUploaded = requiredUploaded === requiredDocs.length

  const getStatusBadge = () => {
    if (!kyc) return null

    const statusConfig: Record<string, { color: string; icon: typeof CheckCircle }> = {
      PENDING_VERIFICATION: { color: "bg-amber-100 text-amber-700", icon: AlertCircle },
      PENDING_REVIEW: { color: "bg-blue-100 text-blue-700", icon: AlertCircle },
      UNDER_VERIFICATION: { color: "bg-purple-100 text-purple-700", icon: AlertCircle },
      APPROVED: { color: "bg-green-100 text-green-700", icon: CheckCircle },
      REJECTED: { color: "bg-red-100 text-red-700", icon: AlertCircle },
    }

    const config = statusConfig[kyc.status] || statusConfig.PENDING_VERIFICATION
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${config.color}`}>
        <Icon className="h-4 w-4" />
        {kyc.status_display}
      </span>
    )
  }

  if (kyc?.status === "APPROVED") {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <div>
            <h3 className="text-lg font-semibold text-green-800">Verification Approved</h3>
            <p className="text-green-700">Your account is now active. You have full access to all banking features.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Complete Your Account Setup</h2>
          <p className="mt-1 text-slate-600">Upload your KYC documents to activate your account</p>
        </div>
        {getStatusBadge()}
      </div>

      {kyc?.status === "REJECTED" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">Verification Rejected</h4>
              <p className="mt-1 text-sm text-red-700">{kyc.rejection_reason}</p>
              <p className="mt-2 text-sm text-red-600">Please correct the issues and resubmit your documents.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {DOCUMENT_TYPES.map((docType) => {
          const state = getDocumentState(docType.value)
          const isUploaded = !!state?.uploaded

          return (
            <Card key={docType.value} className="rounded-xl border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {isUploaded ? (
                      <FileText className="h-5 w-5 text-green-600" />
                    ) : (
                      <Image className="h-5 w-5 text-slate-400" />
                    )}
                    <div>
                      <h4 className="font-medium text-slate-900">
                        {docType.label}
                        {docType.required && <span className="text-red-500 ml-1">*</span>}
                      </h4>
                      {isUploaded && (
                        <p className="text-sm text-slate-500">{state.uploaded?.original_filename}</p>
                      )}
                    </div>
                  </div>
                  {isUploaded && (
                    <button
                      onClick={() => handleDelete(docType.value)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {!isUploaded && (
                  <div className="mt-4">
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
                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 p-4 hover:border-blue-400 hover:bg-blue-50/50">
                          <Upload className="h-5 w-5 text-slate-400" />
                          <span className="text-sm text-slate-600">Click to upload</span>
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
                          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
                            <span className="text-sm text-slate-700 truncate">{state.file.name}</span>
                            <Button
                              size="sm"
                              onClick={() => handleUpload(docType.value)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Upload
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    {state?.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
                  </div>
                )}

                {isUploaded && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Uploaded successfully</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="rounded-xl bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">
              {requiredUploaded} of {requiredDocs.length} required documents uploaded
            </p>
            <div className="mt-2 h-2 w-48 rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all"
                style={{ width: `${(requiredUploaded / requiredDocs.length) * 100}%` }}
              />
            </div>
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
              "Submit for Review"
            )}
          </Button>
        </div>
        {submitError && <p className="mt-2 text-sm text-red-600">{submitError}</p>}
      </div>
    </div>
  )
}
