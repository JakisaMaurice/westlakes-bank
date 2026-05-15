import SectionHeading from "@/components/shared/SectionHeading"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

const faqs = [
  {
    question: "How do I open a savings account?",
    answer: "Click Open Account and complete the registration flow. Our team will verify your details and activate your account quickly.",
  },
  {
    question: "Can I bank from my mobile phone?",
    answer: "Yes. Westlakes Bank offers mobile-first digital banking with secure access on smartphones and tablets.",
  },
  {
    question: "How do I speak with customer support?",
    answer: "Visit our contact page to send a message or call the support desk. Our team is available throughout the week.",
  },
  {
    question: "What makes Westlakes Bank secure?",
    answer: "We use multi-layer encryption, secure login, and proactive fraud monitoring to protect every account.",
  },
]

export default function FAQ() {
  return (
    <div className="space-y-14">
      <section className="rounded-[2rem] bg-white p-10 shadow-sm shadow-slate-200/60">
        <SectionHeading
          eyebrow="FAQ"
          title="Answers to common banking questions."
          description="Find concise guidance on account opening, mobile banking, support, and managing your finances with Westlakes Bank."
        />
      </section>

      <section className="space-y-4">
        <Accordion type="single" defaultValue="item-0">
          {faqs.map((item, index) => (
            <AccordionItem value={`item-${index}`} key={item.question}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>
                <p className="leading-7">{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="rounded-[1.75rem] bg-slate-50 p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Still have questions?</p>
            <p className="mt-3 max-w-2xl text-slate-600 leading-7">Reach out at any time and our banking specialists will help you find the right solution.</p>
          </div>
          <Button className="rounded-full bg-slate-950 px-6 py-3 text-white hover:bg-slate-800">Contact support</Button>
        </div>
      </section>
    </div>
  )
}
