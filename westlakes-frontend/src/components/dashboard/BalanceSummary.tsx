import { type LucideIcon } from "lucide-react"

interface BalanceMetric {
  label: string
  value: string
  change: string
  icon: LucideIcon
  accentHex: string
}

interface BalanceSummaryProps {
  metrics: BalanceMetric[]
}

export function BalanceSummary({ metrics }: BalanceSummaryProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm shadow-slate-950/5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[9px] uppercase tracking-[0.32em] text-slate-500">{metric.label}</p>
                <p className="mt-2 text-xl font-bold text-[#0F172A]">{metric.value}</p>
              </div>
              <div
                className="grid h-8 w-8 shrink-0 place-items-center rounded-2xl text-white"
                style={{ backgroundColor: `${metric.accentHex}20` }}
              >
                <Icon className="size-3.5" style={{ color: metric.accentHex }} />
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">{metric.change}</p>
          </div>
        )
      })}
    </div>
  )
}
