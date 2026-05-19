import { api } from "@/lib/api"

export interface UploadedDocument {
  id: number
  document_type: string
  document_type_display: string
  file: string
  file_url: string | null
  original_filename: string
  file_size: number
  mime_type: string
  uploaded_at: string
}

export interface KYCVerification {
  id: number
  user: number
  user_name: string
  user_email: string
  status: string
  status_display: string
  rejection_reason: string
  admin_notes: string
  reviewed_by: number | null
  reviewed_by_name: string | null
  submitted_at: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
  documents: UploadedDocument[]
}

export interface KYCListResponse {
  count: number
  next: string | null
  previous: string | null
  results: KYCVerification[]
}

export const DOCUMENT_TYPES = [
  { value: "NATIONAL_ID", label: "National ID", required: true },
  { value: "PASSPORT", label: "Passport", required: false },
  { value: "PASSPORT_PHOTO", label: "Passport Photo / Selfie", required: true },
  { value: "PROOF_OF_ADDRESS", label: "Proof of Address", required: true },
  { value: "SIGNATURE", label: "Signature Image", required: true },
  { value: "SUPPORTING", label: "Supporting Document", required: false },
]

const kycService = {
  getMyKYC: () => {
    return api.get<KYCVerification>("/api/kyc/my-kyc/")
  },

  uploadDocument: (documentType: string, file: File, onProgress?: (progress: number) => void) => {
    const formData = new FormData()
    formData.append("document_type", documentType)
    formData.append("file", file)

    return api.post<UploadedDocument>("/api/kyc/upload-document/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
  },

  submitKYC: (documents: { document_type: string; file: File }[]) => {
    return api.post<KYCVerification>("/api/kyc/submit/", { documents })
  },

  deleteDocument: (documentId: number) => {
    return api.delete(`/api/kyc/documents/${documentId}/`)
  },

  getAdminVerifications: (params?: { status?: string; search?: string; page?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set("status", params.status)
    if (params?.search) searchParams.set("search", params.search)
    if (params?.page) searchParams.set("page", String(params.page))
    return api.get<KYCListResponse>(`/api/kyc/admin/verifications/?${searchParams.toString()}`)
  },

  getAdminVerificationDetail: (id: number) => {
    return api.get<KYCVerification>(`/api/kyc/admin/verifications/${id}/`)
  },

  approveKYC: (id: number, adminNotes?: string) => {
    return api.post<KYCVerification>(`/api/kyc/admin/verifications/${id}/approve/`, {
      admin_notes: adminNotes || "",
    })
  },

  rejectKYC: (id: number, rejectionReason: string, adminNotes?: string) => {
    return api.post<KYCVerification>(`/api/kyc/admin/verifications/${id}/reject/`, {
      rejection_reason: rejectionReason,
      admin_notes: adminNotes || "",
    })
  },

  requestChanges: (id: number, reason: string, adminNotes?: string) => {
    return api.post<KYCVerification>(`/api/kyc/admin/verifications/${id}/request-changes/`, {
      rejection_reason: reason,
      admin_notes: adminNotes || "",
    })
  },
}

export default kycService
