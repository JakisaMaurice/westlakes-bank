import { Link } from "react-router-dom"

import SectionHeading from "@/components/shared/SectionHeading"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

const faqs = [
  {
    question: "What can I do on this public website?",
    answer: "You can learn about Westlakes Bank, compare public services, read careers information, review FAQs, and use the contact and account-interest forms.",
  },
  {
    question: "Does this frontend include online banking dashboards?",
    answer: "No. This implementation is scoped to the public-facing website only and does not add customer dashboards, admin dashboards, authentication logic, or backend APIs.",
  },
  {
    question: "Which services does Westlakes Bank present publicly?",
    answer: "The site highlights personal banking, business banking, loans, savings, and investment support.",
  },
  {
    question: "How can I contact Westlakes Bank?",
    answer: "Use the Contact page to send a message or find head-office details and support hours.",
  },
  {
    question: "Can I apply for a job through this site?",
    answer: "The Careers page presents public job listings and application calls to action. No backend application processing is included in this frontend work.",
  },
]

export default function FAQ() {
  return (
    <div>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="FAQ"
            title="Answers for the public Westlakes Bank website."
            description="Quick guidance on what this site includes, how to explore services, and where to start a conversation."
          />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <Accordion type="single" defaultValue="item-0" className="rounded-3xl border-slate-200">
          {faqs.map((item, index) => (
            <AccordionItem key={item.question} value={`item-${index}`}>
              <AccordionTrigger className="text-[#0F172A]">{item.question}</AccordionTrigger>
              <AccordionContent>
                <p className="leading-7 text-slate-600">{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-10 rounded-3xl bg-[#0A3D91] p-8 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#D4AF37]">Need more help?</p>
          <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl leading-7 text-blue-100">A Westlakes specialist can help with account, lending, or service questions.</p>
            <Button asChild className="h-11 rounded-full bg-[#D4AF37] px-6 text-[#0F172A] hover:bg-[#e6c65a]">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
