import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

interface ChartLine {
  dataKey: string
  color: string
  name: string
}

interface AnalyticsChartData {
  period: string
  [key: string]: string | number
}

interface AnalyticsChartProps {
  title: string
  description: string
  data: AnalyticsChartData[]
  accentColor?: string
  dataKey?: string
  lines?: ChartLine[]
}

export function AnalyticsChart({ title, description, data, accentColor = "#1E5EFF", dataKey = "value", lines }: AnalyticsChartProps) {
  const chartLines = lines ?? [{ dataKey, color: accentColor, name: title }]

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-950/5">
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-[#0F172A]">{title}</CardTitle>
            <CardDescription className="mt-1 text-xs text-slate-500">{description}</CardDescription>
          </div>
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-[#E6EEFF] text-[#0A3D91]">
            <Sparkles className="size-4" />
          </span>
        </div>

        <div className="h-[210px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                {chartLines.map((line) => (
                  <linearGradient key={line.dataKey} id={`${line.dataKey}-gradient`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={line.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={line.color} stopOpacity={0.03} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="#E9EEF5" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 8px 24px rgba(15, 23, 42, 0.07)", fontSize: 12 }}
                labelStyle={{ fontWeight: 600 }}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 12, fontSize: 11 }} />
              {chartLines.map((line) => (
                <Area
                  key={line.dataKey}
                  type="monotone"
                  dataKey={line.dataKey}
                  name={line.name}
                  stroke={line.color}
                  strokeWidth={2}
                  fill={`url(#${line.dataKey}-gradient)`}
                  activeDot={{ r: 4, strokeWidth: 2, fill: "#FFFFFF", stroke: line.color }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
