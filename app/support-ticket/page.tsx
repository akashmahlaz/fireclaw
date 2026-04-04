import Navbar from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { SupportTicketForm } from "./SupportTicketForm"

export const metadata = {
  title: "Support Ticket — FireClaw",
  description: "Submit a support ticket and we'll get back to you within 24 hours.",
}

export default function SupportTicket() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-20">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[3px] text-neutral-400">
            Support
          </p>
          <h1 className="mt-3 text-[32px] font-black tracking-[-0.03em] text-neutral-900">
            Submit a ticket
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[14px] text-neutral-500">
            Describe your issue and we&apos;ll get back to you within 24 hours.
          </p>
        </div>

        <SupportTicketForm />
      </main>
      <Footer />
    </>
  )
}
