import * as React from "react"
import { Accordion as AccordionPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

type AccordionProps = {
  className?: string
  type?: "single" | "multiple"
  [key: string]: any
}

function Accordion({ className, type = "single", ...props }: AccordionProps) {
  return (
    <AccordionPrimitive.Root
      type={type as any}
      collapsible={type === "single"}
      className={cn("overflow-hidden rounded-3xl border border-slate-200 bg-white", className)}
      {...props}
    />
  )
}

function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item> & { className?: string }) {
  return (
    <AccordionPrimitive.Item
      className={cn("border-b border-slate-200 last:border-b-0", className)}
      {...props}
    />
  )
}

function AccordionTrigger({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Trigger> & { className?: string }) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          "flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-base font-semibold text-slate-950 transition hover:bg-slate-50",
          className
        )}
        {...props}
      >
        {children}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content> & { className?: string }) {
  return (
    <AccordionPrimitive.Content
      className={cn(
        "overflow-hidden px-6 text-slate-600 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up",
        className
      )}
      {...props}
    >
      <div className="pb-6 pt-2">{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
