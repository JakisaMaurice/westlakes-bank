import { useEffect, useState } from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart"
import { api } from "@/lib/api"
import { Loader2 } from "lucide-react"

export default function Reports() {
  const [reportData, setReportData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await api.get("/api/admin/analytics/")
        setReportData(res.data.monthly_trend.map((item: any) => ({
          period: new Date(item.month).toLocaleDateString("en-GB", { month: "short" }),
          value: item.volume
        })))
      } catch (error) {
        setError("Error fetching data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#1E5EFF]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <Card>
      <CardTitle>Dashboard Analytics</CardTitle>
      <CardContent>
        <AnalyticsChart 
          title="Dashboard Analytics"
          description="This chart displays the analytics data for the dashboard."
        data={reportData} />
      </CardContent>
    </Card>
  )
}
