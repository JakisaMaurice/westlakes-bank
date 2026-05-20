import { useEffect, useState, useCallback, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import kycService, { DOCUMENT_TYPES, type KYCVerification, type UploadedDocument } from "@/services/kycService"
import {
  Loader2, Upload, X, CheckCircle, AlertCircle, FileText, Image,
  ShieldCheck, Clock, XCircle, RefreshCw, KeyRound, Eye, EyeOff, Wallet
} from "lucide-react"

interface ProfileData {
  full_name: string
  email: string
  phone_number: string
  national_id: string
}

interface DocUploadState {
  file: File | null
  uploading: boolean
  progress: number
  error: string | null
}

interface Account {
  id: number
  account_number: string
  account_type: string
  account_type_display: string
  currency: string
  nickname: string
  balance: number
  status: string
  status_display: string
}

const statusConfig: Record<string, { color: string; bgColor: string; icon: typeof Clock; label: string }> = {
  PENDING_VERIFICATION: { color: "text-amber-700", bgColor: "bg-amber-50 border-amber-200", icon: Clock, label: "Not Submitted" },
  PENDING_REVIEW: { color: "text-blue-700", bgColor: "bg-blue-50 border-blue-200", icon: Clock, label: "Pending Review" },
  UNDER_VERIFICATION: { color: "text-purple-700", bgColor: "bg-purple-50 border-purple-200", icon: Clock, label: "Under Verification" },
  APPROVED: { color: "text-green-700", bgColor: "bg-green-50 border-green-200", icon: CheckCircle, label: "Approved" },
  REJECTED: { color: "text-red-700", bgColor: "bg-red-50 border-red-200", icon: XCircle, label: "Rejected" },
}

const accountStatusConfig: Record<string, { color: string; bg: string }> = {
  PENDING_VERIFICATION: { color: "text-amber-700", bg: "bg-amber-50" },
  ACTIVE: { color: "text-green-700", bg: "bg-green-50" },
  SUSPENDED: { color: "text-orange-700", bg: "bg-orange-50" },
  FROZEN: { color: "text-blue-700", bg: "bg-blue-50" },
  LOCKED: { color: "text-slate-700", bg: "bg-slate-100" },
  REJECTED: { color: "text-red-700", bg: "bg-red-50" },
}

type TabId = "personal" | "accounts" | "security" | "kyc"

export default function Profile() {
  const [activeTab, setActiveTab] = useState<TabId>("personal")
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [kyc, setKyc] = useState<KYCVerification | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [profileError, setProfileError] = useState("")
  const [profileSuccess, setProfileSuccess] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [pinError, setPinError] = useState("")
  const [pinSuccess, setPinSuccess] = useState("")

  // Password change
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  // PIN change
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [pinPassword, setPinPassword] = useState("")
  const [showPinPassword, setShowPinPassword] = useState(false)
  const [pinLoading, setPinLoading] = useState(false)

  // Document upload states
  const [uploadStates, setUploadStates] = useState<Record<string, DocUploadState>>({})
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [profileRes, kycRes, accountsRes] = await Promise.all([
        api.get<ProfileData>("/api/auth/profile/"),
        kycService.getMyKYC(),
        api.get<Account[]>("/api/accounts/"),
      ])
      setProfile(profileRes.data)
      setKyc(kycRes.data)
      setAccounts(accountsRes.data)
    } catch {
      setError("Unable to load profile.")
    } finally {
      setLoading(false)
    }
  }, [])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchData()
  }, [fetchData])
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProfileError("")
    setProfileSuccess("")
    try {
      await api.put("/api/auth/profile/", {
        full_name: profile?.full_name,
        phone_number: profile?.phone_number,
      })
      setProfileSuccess("Profile updated successfully.")
    } catch {
      setProfileError("Unable to update profile.")
    }
  }

  const handlePasswordChange = async (event: FormEvent) => {
    event.preventDefault()
    setPasswordError("")
    setPasswordSuccess("")

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.")
      return
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.")
      return
    }

    setPasswordLoading(true)
    try {
      await api.put("/api/auth/profile/", {
        current_password: currentPassword,
        new_password: newPassword,
      })
      setPasswordSuccess("Password changed successfully.")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      setPasswordError(err.response?.data?.error || "Unable to change password.")
    } finally {
      setPasswordLoading(false)
    }
  }

  const handlePinSet = async (event: FormEvent) => {
    event.preventDefault()
    setPinError("")
    setPinSuccess("")

    if (newPin.length < 4 || newPin.length > 6) {
      setPinError("PIN must be 4-6 digits.")
      return
    }
    if (newPin !== confirmPin) {
      setPinError("PINs do not match.")
      return
    }
    if (!pinPassword) {
      setPinError("Please enter your current password to set the PIN.")
      return
    }

    setPinLoading(true)
    try {
      await api.post("/api/auth/set-pin/", { pin: newPin, password: pinPassword })
      setPinSuccess("Transaction PIN set successfully.")
      setNewPin("")
      setConfirmPin("")
      setPinPassword("")
    } catch (err) {
      setPinError(err.response?.data?.error || "Unable to set PIN.")
    } finally {
      setPinLoading(false)
    }
  }

  const getUploadState = (docType: string): DocUploadState => {
    return uploadStates[docType] || { file: null, uploading: false, progress: 0, error: null }
  }

  const updateUploadState = (docType: string, updates: Partial<DocUploadState>) => {
    setUploadStates((prev) => ({
      ...prev,
      [docType]: { ...getUploadState(docType), ...updates },
    }))
  }

  const getUploadedDoc = (docType: string): UploadedDocument | undefined => {
    return kyc?.documents?.find((d) => d.document_type === docType)
  }

  const handleFileSelect = (docType: string, file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      updateUploadState(docType, { error: "Only JPG, PNG, and PDF files are allowed" })
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      updateUploadState(docType, { error: "File size must be less than 10MB" })
      return
    }
    updateUploadState(docType, { file, error: null })
  }

  const handleUpload = async (docType: string) => {
    const state = getUploadState(docType)
    if (!state.file) return
    updateUploadState(docType, { uploading: true, progress: 0, error: null })
    try {
      await kycService.uploadDocument(docType, state.file, (progress) => {
        updateUploadState(docType, { progress })
      })
      updateUploadState(docType, { file: null, uploading: false, progress: 0 })
      fetchData()
    } catch (err) {
      updateUploadState(docType, {
        uploading: false,
        error: err.response?.data?.error || "Upload failed",
      })
    }
  }

  const handleDelete = async (docType: string) => {
    const doc = getUploadedDoc(docType)
    if (!doc) return
    try {
      await kycService.deleteDocument(doc.id)
      fetchData()
    } catch {
      setError("Failed to delete document.")
    }
  }

  const handleSubmitKYC = async () => {
    setSubmitting(true)
    setError("")
    setSuccess("")
    try {
      await kycService.submitKYC([])
      setSuccess("Documents submitted for review. You will be notified once the review is complete.")
      fetchData()
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit KYC.")
    } finally {
      setSubmitting(false)
    }
  }

  const requiredDocs = DOCUMENT_TYPES.filter((d) => d.required)
  const uploadedRequired = requiredDocs.filter((d) => getUploadedDoc(d.value)).length
  const allRequiredUploaded = uploadedRequired === requiredDocs.length
  const canSubmit = allRequiredUploaded && kyc?.status !== "PENDING_REVIEW" && kyc?.status !== "UNDER_VERIFICATION" && kyc?.status !== "APPROVED"

  const kycStatus = kyc?.status || "PENDING_VERIFICATION"
  const status = statusConfig[kycStatus] || statusConfig.PENDING_VERIFICATION
  const StatusIcon = status.icon

  const tabs: { id: TabId; label: string }[] = [
    { id: "personal", label: "Personal Info" },
    { id: "accounts", label: "Linked Accounts" },
    { id: "security", label: "Security" },
    { id: "kyc", label: "KYC Documents" },
  ]

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Profile</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Manage your account</h1>
        <p className="mt-1 text-slate-600">Update your personal details, security settings, and KYC documents</p>
      </div>

      {/* KYC Status Banner */}
      <div className={`rounded-2xl border p-5 ${status.bgColor}`}>
        <div className="flex items-center gap-3">
          <StatusIcon className={`h-6 w-6 ${status.color}`} />
          <div className="flex-1">
            <p className={`font-semibold ${status.color}`}>KYC Status: {status.label}</p>
            {kyc?.status === "REJECTED" && kyc.rejection_reason && (
              <p className="mt-1 text-sm text-red-700">{kyc.rejection_reason}</p>
            )}
            {kyc?.status === "APPROVED" && (
              <p className="mt-1 text-sm text-green-700">Your identity has been verified. Full account access granted.</p>
            )}
            {(kyc?.status === "PENDING_REVIEW" || kyc?.status === "UNDER_VERIFICATION") && (
              <p className="mt-1 text-sm text-blue-700">Your documents are being reviewed. You will be notified of the outcome.</p>
            )}
            {(kyc?.status === "PENDING_VERIFICATION" || !kyc) && (
              <p className="mt-1 text-sm text-amber-700">Upload your documents to verify your identity and activate your account.</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              activeTab === tab.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Personal Information Tab */}
      {activeTab === "personal" && (
        <Card className="rounded-2xl border-slate-200">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            {profile && (
              <form className="grid gap-6" onSubmit={handleProfileSubmit}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
                    <Input
                      type="text"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Email address</label>
                    <Input type="email" value={profile.email} disabled />
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Phone number</label>
                    <Input
                      type="tel"
                      value={profile.phone_number}
                      onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">National ID</label>
                    <Input type="text" value={profile.national_id} disabled />
                  </div>
                </div>
                {profileError && <p className="text-sm text-red-600">{profileError}</p>}
                {profileSuccess && <p className="text-sm text-emerald-600">{profileSuccess}</p>}
                <div className="flex justify-end">
                  <Button type="submit" className="bg-slate-950 hover:bg-slate-800">
                    Save changes
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Linked Accounts Tab */}
      {activeTab === "accounts" && (
        <Card className="rounded-2xl border-slate-200">
          <CardHeader>
            <CardTitle>Linked Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <p className="text-sm text-slate-500">No accounts found.</p>
            ) : (
              <div className="space-y-3">
                {accounts.map((account) => {
                  const config = accountStatusConfig[account.status] || accountStatusConfig.REJECTED
                  return (
                    <div key={account.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                      <div className="flex items-center gap-4">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100">
                          <Wallet className="h-5 w-5 text-slate-500" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {account.nickname || account.account_type_display}
                          </p>
                          <p className="font-mono text-xs text-slate-500">{account.account_number}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">
                          {Number(account.balance).toLocaleString("en-GB", { style: "currency", currency: account.currency })}
                        </p>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.color} ${config.bg}`}>
                          {account.status_display || account.status}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-6">
          {/* Change Password */}
          <Card className="rounded-2xl border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-slate-400" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4 max-w-md" onSubmit={handlePasswordChange}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Current Password</label>
                  <div className="relative">
                    <Input
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">New Password</label>
                  <div className="relative">
                    <Input
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Confirm New Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
                {passwordSuccess && <p className="text-sm text-emerald-600">{passwordSuccess}</p>}
                <Button type="submit" disabled={passwordLoading} className="bg-slate-950 hover:bg-slate-800">
                  {passwordLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Transaction PIN */}
          <Card className="rounded-2xl border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-slate-400" />
                Transaction PIN
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4 max-w-md" onSubmit={handlePinSet}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">New PIN (4-6 digits)</label>
                  <Input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                    maxLength={6}
                    placeholder="Enter 4-6 digit PIN"
                    className="text-center text-xl tracking-widest"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Confirm PIN</label>
                  <Input
                    type="password"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                    maxLength={6}
                    placeholder="Confirm PIN"
                    className="text-center text-xl tracking-widest"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Current Password</label>
                  <div className="relative">
                    <Input
                      type={showPinPassword ? "text" : "password"}
                      value={pinPassword}
                      onChange={(e) => setPinPassword(e.target.value)}
                      placeholder="Enter your current password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPinPassword(!showPinPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPinPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Required to verify your identity before setting a PIN</p>
                </div>
                {pinError && <p className="text-sm text-red-600">{pinError}</p>}
                {pinSuccess && <p className="text-sm text-emerald-600">{pinSuccess}</p>}
                <Button type="submit" disabled={pinLoading} className="bg-slate-950 hover:bg-slate-800">
                  {pinLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting...
                    </>
                  ) : (
                    "Set Transaction PIN"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* KYC Documents Tab */}
      {activeTab === "kyc" && (
        <Card className="rounded-2xl border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>KYC Documents</CardTitle>
                <p className="mt-1 text-sm text-slate-500">
                  Upload identity documents required for account verification
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-600">
                  {uploadedRequired}/{requiredDocs.length} required
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                <CheckCircle className="h-4 w-4" />
                {success}
              </div>
            )}

            {DOCUMENT_TYPES.map((docType) => {
              const uploaded = getUploadedDoc(docType.value)
              const uploadState = getUploadState(docType.value)
              const hasFile = !!uploadState.file

              return (
                <div
                  key={docType.value}
                  className={`rounded-xl border p-4 transition ${
                    uploaded ? "border-green-200 bg-green-50/30" : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      uploaded ? "bg-green-100" : "bg-slate-100"
                    }`}>
                      {uploaded ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Image className="h-5 w-5 text-slate-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-slate-900">{docType.label}</h4>
                        {docType.required && (
                          <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                            REQUIRED
                          </span>
                        )}
                      </div>

                      {uploaded && !hasFile && !uploadState.uploading && (
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-700 truncate max-w-[250px]">
                              {uploaded.original_filename}
                            </span>
                            <span className="text-xs text-slate-400">
                              ({(uploaded.file_size / 1024).toFixed(0)} KB)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {uploaded.file_url && (
                              <a
                                href={uploaded.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                View document
                              </a>
                            )}
                            {kyc?.status !== "APPROVED" && kyc?.status !== "PENDING_REVIEW" && kyc?.status !== "UNDER_VERIFICATION" && (
                              <>
                                <span className="text-xs text-slate-300">|</span>
                                <button
                                  onClick={() => handleDelete(docType.value)}
                                  className="text-xs text-red-600 hover:underline"
                                >
                                  Remove
                                </button>
                                <span className="text-xs text-slate-300">|</span>
                                <label className="cursor-pointer text-xs text-blue-600 hover:underline">
                                  Replace
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
                              </>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">
                            Uploaded {new Date(uploaded.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {uploadState.uploading && (
                        <div className="mt-2 space-y-2">
                          <div className="h-2 w-full rounded-full bg-slate-100">
                            <div
                              className="h-2 rounded-full bg-blue-600 transition-all"
                              style={{ width: `${uploadState.progress}%` }}
                            />
                          </div>
                          <p className="text-sm text-slate-500">Uploading... {uploadState.progress}%</p>
                        </div>
                      )}

                      {hasFile && !uploadState.uploading && uploadState.file && (
                        <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-50 p-2.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                            <span className="text-sm text-slate-700 truncate">{uploadState.file.name}</span>
                            <span className="text-xs text-slate-400">
                              ({(uploadState.file.size / 1024 / 1024).toFixed(1)} MB)
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              size="sm"
                              onClick={() => handleUpload(docType.value)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Upload
                            </Button>
                            <button
                              onClick={() => updateUploadState(docType.value, { file: null })}
                              className="rounded p-1 text-slate-400 hover:text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {!uploaded && !hasFile && !uploadState.uploading && (
                        <div className="mt-2">
                          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 p-4 transition hover:border-blue-400 hover:bg-blue-50/30">
                            <Upload className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-500">Click to upload JPG, PNG or PDF (max 10MB)</span>
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
                        </div>
                      )}

                      {uploadState.error && (
                        <p className="mt-2 text-sm text-red-600">{uploadState.error}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {kyc?.status !== "APPROVED" && (
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {kyc?.status === "PENDING_REVIEW" || kyc?.status === "UNDER_VERIFICATION"
                      ? "Documents are under review"
                      : canSubmit
                      ? "All required documents uploaded"
                      : `Upload all required documents to submit (${uploadedRequired}/${requiredDocs.length})`}
                  </p>
                  {kyc?.status === "PENDING_REVIEW" || kyc?.status === "UNDER_VERIFICATION" ? (
                    <p className="mt-0.5 text-xs text-slate-500">You will be notified once the review is complete.</p>
                  ) : null}
                </div>
                <Button
                  onClick={handleSubmitKYC}
                  disabled={!canSubmit || submitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : kyc?.status === "REJECTED" ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resubmit
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Submit for Review
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
