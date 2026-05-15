import { useEffect, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"

export default function Profile() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [nationalId, setNationalId] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void api
      .get("/api/auth/profile/")
      .then((response) => {
        setFullName(response.data.full_name)
        setEmail(response.data.email)
        setPhoneNumber(response.data.phone_number)
        setNationalId(response.data.national_id)
      })
      .catch(() => setError("Unable to load profile."))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSuccess("")

    try {
      await api.put("/api/auth/profile/", {
        full_name: fullName,
        phone_number: phoneNumber,
      })
      setSuccess("Profile updated successfully.")
    } catch {
      setError("Unable to update profile.")
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Profile</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Manage your account details</h1>
      </div>
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        {loading ? (
          <p className="text-slate-600">Loading profile...</p>
        ) : (
          <form className="grid gap-6" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
                <Input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email address</label>
                <Input type="email" value={email} disabled />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Phone number</label>
                <Input type="tel" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">National ID</label>
                <Input type="text" value={nationalId} disabled />
              </div>
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-600">Update your profile details and keep your contact information current.</div>
              <Button type="submit" className="rounded-full bg-slate-950 px-6 py-3 text-white hover:bg-slate-800">
                Save changes
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
