import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  eyebrow: string
  title: string
  description?: string
  className?: string
}

export default function SectionHeading({ eyebrow, title, description, className }: SectionHeadingProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <p className="text-sm uppercase tracking-[0.28em] text-amber-500">{eyebrow}</p>
      <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h2>
      {description ? <p className="max-w-2xl text-lg leading-8 text-slate-600">{description}</p> : null}
    </div>
  )
}
