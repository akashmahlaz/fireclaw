import Navbar from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import Link from "next/link"

export const metadata = {
  title: "Terms and Conditions — FireClaw",
}

export default function TermsAndConditions() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-[32px] font-black tracking-[-0.03em] text-neutral-900">
          Terms and Conditions
        </h1>
        <p className="mt-2 text-[13px] text-neutral-400">Last updated: April 4, 2026</p>

        <div className="mt-10 space-y-8 text-[14px] leading-relaxed text-neutral-600">
          <section>
            <h2 className="mb-3 text-[16px] font-bold text-neutral-900">1. Acceptance of Terms</h2>
            <p>
              By accessing or using FireClaw (&quot;the Service&quot;), you agree to be bound by these Terms and Conditions. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-[16px] font-bold text-neutral-900">2. Service Description</h2>
            <p>
              FireClaw provides a platform for deploying AI agents powered by OpenClaw on dedicated virtual private servers. We provision infrastructure, manage DNS, and provide a management dashboard.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-[16px] font-bold text-neutral-900">3. Account Registration</h2>
            <p>
              You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials. You must be at least 18 years old to use the Service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-[16px] font-bold text-neutral-900">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Distribute malware, spam, or harmful content through deployed agents</li>
              <li>Attempt to gain unauthorized access to other users&apos; servers or data</li>
              <li>Exceed your plan&apos;s resource limits or circumvent usage restrictions</li>
              <li>Resell or redistribute the Service without written permission</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-[16px] font-bold text-neutral-900">5. Payment and Billing</h2>
            <p>
              Paid plans are billed on a recurring monthly basis. All payments are processed through Razorpay. Prices are in INR and exclude applicable taxes. We reserve the right to change pricing with 30 days&apos; notice.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-[16px] font-bold text-neutral-900">6. Server Resources</h2>
            <p>
              Deployed servers are provisioned on third-party infrastructure (Hetzner Cloud). We do not guarantee 100% uptime. Server availability is subject to the infrastructure provider&apos;s SLA.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-[16px] font-bold text-neutral-900">7. Data and Privacy</h2>
            <p>
              Your use of the Service is also governed by our{" "}
              <Link href="/privacy-policy" className="font-medium text-neutral-900 underline underline-offset-2">
                Privacy Policy
              </Link>
              . You retain ownership of data processed by your deployed agents.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-[16px] font-bold text-neutral-900">8. Termination</h2>
            <p>
              We may suspend or terminate your account if you violate these terms. Upon termination, your deployed servers will be destroyed within 7 days. You may cancel your account at any time from the dashboard.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-[16px] font-bold text-neutral-900">9. Limitation of Liability</h2>
            <p>
              FireClaw is provided &quot;as is&quot; without warranty. We are not liable for indirect, incidental, or consequential damages. Our total liability is limited to the amount you paid in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-[16px] font-bold text-neutral-900">10. Changes to Terms</h2>
            <p>
              We may update these terms at any time. Continued use of the Service after changes constitutes acceptance. We will notify users of material changes via email.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-[16px] font-bold text-neutral-900">11. Contact</h2>
            <p>
              Questions about these terms? Contact us at{" "}
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
