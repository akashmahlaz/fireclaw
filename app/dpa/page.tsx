import Navbar from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

export const metadata = {
  title: "Data Processing Agreement — FireClaw",
}

export default function DPA() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-[32px] font-black tracking-[-0.03em] text-neutral-900">
          Data Processing Agreement
        </h1>
        <p className="mt-2 text-[13px] text-neutral-400">Last updated: April 4, 2026</p>

        <div className="mt-10 space-y-8 text-[14px] leading-relaxed text-neutral-600">
          <section>
            <h2 className="mb-3 text-[16px] font-bold text-neutral-900">1. Scope</h2>
            <p>
              This Data Processing Agreement (&quot;DPA&quot;) applies to the processing of personal data by FireClaw on behalf of you (&quot;Data Controller&quot;) in connection with your use of the FireClaw platform.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-[16px] font-bold text-neutral-900">2. Data Processing</h2>
            <p>
              FireClaw processes data only to provide the Service as described in the Terms and Conditions. We act as a Data Processor for data that flows through your deployed AI agents.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-[16px] font-bold text-neutral-900">3. Sub-Processors</h2>
            <p>We use the following sub-processors:</p>
            <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th className="px-4 py-2.5 text-left font-semibold text-neutral-900">Provider</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-neutral-900">Purpose</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-neutral-900">Location</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-neutral-100">
                    <td className="px-4 py-2.5">Hetzner Cloud</td>
                    <td className="px-4 py-2.5">Server infrastructure</td>
                    <td className="px-4 py-2.5">Germany / Finland</td>
                  </tr>
                  <tr className="border-b border-neutral-100">
                    <td className="px-4 py-2.5">Cloudflare</td>
                    <td className="px-4 py-2.5">DNS management</td>
                    <td className="px-4 py-2.5">Global</td>
                  </tr>
                  <tr className="border-b border-neutral-100">
                    <td className="px-4 py-2.5">MongoDB Atlas</td>
                    <td className="px-4 py-2.5">Database</td>
                    <td className="px-4 py-2.5">Cloud</td>
                  </tr>
                  <tr className="border-b border-neutral-100">
                    <td className="px-4 py-2.5">Vercel</td>
                    <td className="px-4 py-2.5">Application hosting</td>
                    <td className="px-4 py-2.5">Global</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5">Resend</td>
                    <td className="px-4 py-2.5">Email delivery</td>
                    <td className="px-4 py-2.5">US</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-[16px] font-bold text-neutral-900">4. Security Measures</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>TLS encryption for all data in transit</li>
              <li>Encrypted storage for sensitive data at rest</li>
              <li>Access controls and authentication for all systems</li>
              <li>Regular security assessments</li>
              <li>Dedicated VPS isolation per customer agent</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-[16px] font-bold text-neutral-900">5. Data Breach Notification</h2>
            <p>
              In the event of a personal data breach, we will notify you within 72 hours of becoming aware of the breach, including the nature of the breach, affected data, and remediation steps.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-[16px] font-bold text-neutral-900">6. Contact</h2>
            <p>
              For DPA inquiries, contact{" "}
              <a href="mailto:legal@fireclaw.ai" className="font-medium text-neutral-900 underline underline-offset-2">
                legal@fireclaw.ai
              </a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
