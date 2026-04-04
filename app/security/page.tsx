import Navbar from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Shield, Lock, Server, Eye, AlertTriangle, CheckCircle } from "lucide-react"

export const metadata = {
  title: "Security — FireClaw",
}

const practices = [
  {
    icon: Lock,
    title: "Encryption Everywhere",
    description:
      "All data in transit is encrypted with TLS 1.3. Passwords are hashed with bcrypt (12 rounds). API keys and secrets are stored encrypted at rest.",
  },
  {
    icon: Server,
    title: "Isolated Infrastructure",
    description:
      "Each deployed agent runs on its own dedicated VPS with isolated networking. No shared containers or multi-tenant runtimes.",
  },
  {
    icon: Shield,
    title: "Firewall by Default",
    description:
      "Every provisioned server has a Hetzner Cloud Firewall allowing only SSH (22), HTTP (80), and HTTPS (443). All other ports are blocked.",
  },
  {
    icon: Eye,
    title: "Automated HTTPS",
    description:
      "All agent domains get automatic Let's Encrypt TLS certificates via Caddy reverse proxy. No manual certificate management required.",
  },
  {
    icon: AlertTriangle,
    title: "Rate Limiting",
    description:
      "All API endpoints are rate-limited to prevent brute-force attacks. Authentication endpoints have strict per-IP limits.",
  },
  {
    icon: CheckCircle,
    title: "Secure Authentication",
    description:
      "Email verification with OTP, password reset via email, bcrypt hashing, JWT sessions, and OAuth 2.0 via Google.",
  },
]

export default function Security() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[3px] text-neutral-400">
            Security
          </p>
          <h1 className="mt-3 text-[32px] font-black tracking-[-0.03em] text-neutral-900">
            Built with security first
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[14px] text-neutral-500">
            FireClaw takes security seriously at every layer — from authentication to infrastructure isolation. Here&apos;s how we protect your data and agents.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {practices.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <item.icon className="size-5 text-neutral-900" strokeWidth={2} />
              <h3 className="mt-3 text-[14px] font-bold text-neutral-900">{item.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center">
          <h2 className="text-[18px] font-bold text-neutral-900">Report a Vulnerability</h2>
          <p className="mt-2 text-[14px] text-neutral-500">
            Found a security issue? We appreciate responsible disclosure.
          </p>
          <a
            href="mailto:security@fireclaw.ai"
            className="mt-4 inline-block rounded-full bg-neutral-900 px-6 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-neutral-700"
          >
            security@fireclaw.ai
          </a>
        </div>
      </main>
      <Footer />
    </>
  )
}
