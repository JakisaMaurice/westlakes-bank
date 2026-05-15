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
]

export default function FAQ() {
  return (
    <div className="space-y-12">
      <section className="rounded-[2rem] bg-white p-10 shadow-sm shadow-slate-200/60">
        <p className="text-sm uppercase tracking-[0.32em] text-amber-500">FAQ</p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-950 sm:text-5xl">Answers to common banking questions.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Find concise guidance on account opening, mobile banking, support, and managing your finances with Westlakes Bank.
        </p>
      </section>

      <section className="grid gap-4">
        {faqs.map((item) => (
          <details key={item.question} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <summary className="cursor-pointer text-lg font-semibold text-slate-950">{item.question}</summary>
            <p className="mt-4 text-slate-600 leading-7">{item.answer}</p>
          </details>
        ))}
      </section>

      <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.32em] text-amber-500">Still have questions?</p>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <p className="max-w-2xl text-slate-600">
            Reach out at any time and our banking specialists will help you find the right solution.
          </p>
          <Button className="rounded-full bg-slate-950 px-6 py-3 text-white hover:bg-slate-800">Contact support</Button>
        </div>
      </div>
    </div>
  )
}
