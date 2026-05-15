import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"

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

  useEffect(() => {
    void api
      .get<ApprovalRequest[]>("/api/accounts/")
      .then((response) => setRequests(response.data.filter((item) => item.status === "PENDING")))
      .catch(() => setError("Unable to load approvals."))
      .finally(() => setLoading(false))
  }, [])

  const approveAccount = async (id: number) => {
    try {
      await api.post(`/api/accounts/${id}/approve/`)
      setRequests((current) => current.filter((item) => item.id !== id))
    } catch {
      setError("Unable to approve account.")
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Approvals</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Review account requests</h1>
      </div>

      {loading ? (
        <p className="text-slate-600">Loading approval requests...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {requests.map((request) => (
            <Card key={request.id} className="rounded-[1.75rem] border-slate-200">
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{request.account_type}</p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">{request.user_name}</p>
                  <p className="text-sm text-slate-600">{request.account_number}</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-2xl bg-slate-100 px-3 py-1 text-sm text-slate-700">{request.status}</span>
                  <Button variant="outline" className="rounded-full px-4 py-2 text-slate-700 hover:bg-slate-100" onClick={() => approveAccount(request.id)}>
                    Approve
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
