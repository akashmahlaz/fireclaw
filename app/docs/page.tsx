import Navbar from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import Link from "next/link"
import { Book, Terminal, CreditCard, Shield, Rocket, Settings, ArrowRight } from "lucide-react"

export const metadata = {
  title: "Documentation — FireClaw",
}

const sections = [
  {
    icon: Rocket,
    title: "Getting Started",
    description: "Create your account, pick a plan, and deploy your first AI agent in under 60 seconds.",
    links: [
      { label: "Quick Start Guide", href: "#quick-start" },
      { label: "Account Setup", href: "#account" },
      { label: "Your First Agent", href: "#first-agent" },
    ],
  },
  {
    icon: Terminal,
    title: "Agent Management",
    description: "Deploy, monitor, reboot, and manage your AI agents from the dashboard.",
    links: [
      { label: "Deploy Wizard", href: "#deploy" },
      { label: "Agent Controls", href: "#controls" },
      { label: "SSH Access", href: "#ssh" },
    ],
  },
  {
    icon: Settings,
    title: "Configuration",
    description: "Customize your agent's behavior, channels, and LLM settings.",
    links: [
      { label: "Channel Setup", href: "#channels" },
      { label: "API Keys", href: "#api-keys" },
      { label: "Custom Domains", href: "#domains" },
    ],
  },
  {
    icon: CreditCard,
    title: "Billing & Plans",
    description: "Understand pricing tiers, plan limits, and payment management.",
    links: [
      { label: "Plan Comparison", href: "#plans" },
      { label: "Upgrade / Downgrade", href: "#upgrade" },
      { label: "Payment Methods", href: "#payments" },
    ],
  },
  {
    icon: Book,
    title: "API Reference",
    description: "Programmatic access to manage agents, check status, and retrieve metrics.",
    links: [
      { label: "REST API Docs", href: "/docs/api" },
      { label: "Webhooks", href: "#webhooks" },
      { label: "Rate Limits", href: "#rate-limits" },
    ],
  },
  {
    icon: Shield,
    title: "Security & Compliance",
    description: "How we protect your data, infrastructure isolation, and compliance.",
    links: [
      { label: "Security Practices", href: "/security" },
      { label: "Data Processing", href: "/dpa" },
      { label: "Privacy Policy", href: "/privacy-policy" },
    ],
  },
]

export default function Docs() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-20">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[3px] text-neutral-400">
            Documentation
          </p>
          <h1 className="mt-3 text-[32px] font-black tracking-[-0.03em] text-neutral-900">
            Learn FireClaw
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[14px] text-neutral-500">
            Everything you need to deploy and manage AI agents on dedicated infrastructure.
          </p>
        </div>

        {/* Quick start banner */}
        <div className="mt-12 rounded-2xl bg-neutral-900 p-8 sm:p-10" id="quick-start">
          <h2 className="text-[20px] font-black text-white">Quick Start</h2>
          <div className="mt-4 space-y-3 text-[14px] leading-relaxed text-neutral-300">
            <p>
              <span className="mr-2 inline-flex size-6 items-center justify-center rounded-full bg-white/10 text-[12px] font-bold text-white">
                1
              </span>
              Create an account at{" "}
              <Link href="/auth/signin" className="font-medium text-white underline underline-offset-2">
                fireclaw.ai/auth/signin
              </Link>
            </p>
            <p>
              <span className="mr-2 inline-flex size-6 items-center justify-center rounded-full bg-white/10 text-[12px] font-bold text-white">
                2
              </span>
              Choose a plan from the{" "}
              <Link href="/dashboard/checkout" className="font-medium text-white underline underline-offset-2">
                checkout page
              </Link>
            </p>
            <p>
              <span className="mr-2 inline-flex size-6 items-center justify-center rounded-full bg-white/10 text-[12px] font-bold text-white">
                3
              </span>
              Go to{" "}
              <Link href="/dashboard/deploy" className="font-medium text-white underline underline-offset-2">
                Deploy
              </Link>
              , name your agent, and click Deploy — done!
            </p>
          </div>
        </div>

        {/* Doc sections grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-2xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <section.icon className="size-5 text-neutral-900" strokeWidth={2} />
              <h3 className="mt-3 text-[15px] font-bold text-neutral-900">{section.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">
                {section.description}
              </p>
              <ul className="mt-4 space-y-1.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center gap-1 text-[13px] font-medium text-neutral-600 transition-colors hover:text-neutral-900"
                    >
                      <ArrowRight className="size-3" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Help banner */}
        <div className="mt-12 rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center">
          <p className="text-[14px] text-neutral-500">
            Can&apos;t find what you&apos;re looking for?{" "}
            <Link href="/contact" className="font-semibold text-neutral-900 underline underline-offset-2">
              Contact support
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
