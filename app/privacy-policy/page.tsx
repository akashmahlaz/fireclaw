import Navbar from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import Link from "next/link"

export const metadata = {
  title: "Privacy Policy — FireClaw",
}

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-[32px] font-black tracking-[-0.03em] text-neutral-900">
          Privacy Policy
        </h1>
        <p className="mt-2 text-[13px] text-neutral-400">Last updated: April 4, 2026</p>

        <div className="mt-10 space-y-8 text-[14px] leading-relaxed text-neutral-600">
          <section>
            <h2 className="mb-3 text-[16px] font-bold text-neutral-900">1. Information We Collect</h2>
            <p>We collect the following information when you use FireClaw:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Account data:</strong> Name, email address, and profile image (if using Google Sign-In)</li>
              <li><strong>Payment data:</strong> Processed by Razorpay — we do not store card details</li>
              <li><strong>Usage data:</strong> Server provisioning records, agent configurations, and dashboard activity</li>
              <li><strong>Technical data:</strong> IP address, browser type, and device information</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-[16px] font-bold text-neutral-900">2. How We Use Your Information</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Provision and manage your deployed AI agents</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send transactional emails (deployment status, payment receipts, security alerts)</li>
              <li>Improve and maintain the Service</li>
              <li>Prevent fraud and enforce our terms</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-[16px] font-bold text-neutral-900">3. Data Storage</h2>
            <p>
              Account data is stored in MongoDB Atlas. Deployed servers run on Hetzner Cloud (Germany/Finland). DNS records are managed via Cloudflare. We use industry-standard encryption for data in transit (TLS) and at rest.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-[16px] font-bold text-neutral-900">4. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Hetzner Cloud:</strong> Server infrastructure</li>
              <li><strong>Cloudflare:</strong> DNS and CDN</li>
              <li><strong>Razorpay:</strong> Payment processing</li>
              <li><strong>Resend:</strong> Transactional email delivery</li>
              <li><strong>Google:</strong> OAuth authentication</li>
              <li><strong>Vercel:</strong> Application hosting</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-[16px] font-bold text-neutral-900">5. Data Retention</h2>
            <p>
              We retain your account data for as long as your account is active. Server logs are retained for 30 days. Payment records are retained for 7 years as required by tax regulations. Upon account deletion, personal data is removed within 30 days.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-[16px] font-bold text-neutral-900">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent for data processing</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, contact us at{" "}
              <a href="mailto:privacy@fireclaw.ai" className="font-medium text-neutral-900 underline underline-offset-2">
                privacy@fireclaw.ai
              </a>
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-[16px] font-bold text-neutral-900">7. Cookies</h2>
            <p>
              We use essential cookies for authentication sessions. We do not use tracking or advertising cookies. Third-party services may set their own cookies subject to their own policies.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-[16px] font-bold text-neutral-900">8. Changes to This Policy</h2>
            <p>
              We may update this policy periodically. We will notify you of material changes via email. Continued use of the Service constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-[16px] font-bold text-neutral-900">9. Contact</h2>
            <p>
              For privacy inquiries, contact us at{" "}
              <a href="mailto:privacy@fireclaw.ai" className="font-medium text-neutral-900 underline underline-offset-2">
                privacy@fireclaw.ai
              </a>
              {" "}or visit our{" "}
              <Link href="/contact" className="font-medium text-neutral-900 underline underline-offset-2">
                contact page
              </Link>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
