import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ShieldCheck, Clock, AlertCircle, FileText } from "lucide-react"
import kycService from "@/services/kycService"

interface KYCGateProps {
  children: React.ReactNode
}

type KYCState = "loading" | "approved" | "not_approved" | "error"

export default function KYCGate({ children }: KYCGateProps) {
  const navigate = useNavigate()
  const [kycState, setKycState] = useState<KYCState>("loading")
  const [statusDisplay, setStatusDisplay] = useState("")

  useEffect(() => {
    const check = async () => {
      try {
        const res = await kycService.getMyKYC()
        if (res.data.status === "APPROVED") {
          setKycState("approved")
        } else {
          setKycState("not_approved")
          setStatusDisplay(res.data.status_display || "Not Approved")
        }
      } catch {
        setKycState("error")
      }
    }
    check()
  }, [])

  if (kycState === "loading") {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (kycState === "approved") {
    return <>{children}</>
  }

  const getIcon = () => {
    switch (kycState) {
      case "error":
        return <AlertCircle className="h-10 w-10 text-red-500" />
      case "not_approved":
        return <Clock className="h-10 w-10 text-amber-500" />
      default:
        return <FileText className="h-10 w-10 text-slate-400" />
    }
  }

  const getTitle = () => {
    switch (kycState) {
      case "error":
        return "Unable to verify your status"
      case "not_approved":
        return "Identity verification required"
      default:
        return "Verification needed"
    }
  }

  const getMessage = () => {
    switch (kycState) {
      case "error":
        return "We couldn't verify your KYC status. Please try again or contact support."
      case "not_approved":
        return `Your identity verification is currently: ${statusDisplay}. You must complete and be approved for KYC before accessing banking features.`
      default:
        return "Complete your identity verification to access this feature."
    }
  }

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Card className="max-w-md rounded-2xl border-slate-200 shadow-sm">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-slate-50 p-4">
              {getIcon()}
            </div>
          </div>
          <h2 className="text-xl font-semibold text-slate-900">{getTitle()}</h2>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">{getMessage()}</p>
          <div className="mt-6 flex flex-col gap-2">
            <Button
              onClick={() => navigate("/dashboard/verify", { replace: true })}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              {kycState === "error" ? "Go to Verification" : "Complete Verification"}
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard", { replace: true })}>
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
