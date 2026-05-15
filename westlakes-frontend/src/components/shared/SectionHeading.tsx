import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  eyebrow: string
  title: string
  description?: string
  className?: string
  align?: "left" | "center"
}

export default function SectionHeading({ eyebrow, title, description, className, align = "left" }: SectionHeadingProps) {
  return (
    <div className={cn("space-y-4", align === "center" && "mx-auto max-w-3xl text-center", className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#D4AF37]">{eyebrow}</p>
      <h2 className="text-3xl font-semibold tracking-tight text-[#0F172A] sm:text-4xl lg:text-5xl">{title}</h2>
      {description ? (
        <p className={cn("text-base leading-8 text-slate-600 sm:text-lg", align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl")}>
          {description}
        </p>
      ) : null}
    </div>
  )
}
