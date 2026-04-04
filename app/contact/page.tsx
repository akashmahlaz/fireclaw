import Navbar from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { ContactForm } from "./ContactForm"

export const metadata = {
  title: "Contact — FireClaw",
  description: "Get in touch with FireClaw support.",
}

export default function Contact() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[3px] text-neutral-400">
            Contact
          </p>
          <h1 className="mt-3 text-[32px] font-black tracking-[-0.03em] text-neutral-900">
            Get in touch
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[14px] text-neutral-500">
            Have a question, feedback, or need help? We&apos;d love to hear from you.
          </p>
        </div>

        <ContactForm />
      </main>
      <Footer />
    </>
  )
}
