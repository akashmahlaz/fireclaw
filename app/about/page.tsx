import Navbar from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Rocket, Zap, Globe, Users } from "lucide-react"

export const metadata = {
  title: "About — FireClaw",
}

export default function About() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[3px] text-neutral-400">
            About
          </p>
          <h1 className="mt-3 text-[32px] font-black tracking-[-0.03em] text-neutral-900">
            AI agents for everyone
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-neutral-500">
            FireClaw makes it dead simple to deploy your own AI assistant on dedicated infrastructure. No DevOps experience needed — just pick a plan, configure your agent, and we handle the rest.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-8">
            <Rocket className="size-6 text-neutral-900" strokeWidth={1.5} />
            <h3 className="mt-4 text-[16px] font-bold text-neutral-900">Our Mission</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-neutral-500">
              Democratize AI deployment. We believe everyone should be able to run their own AI agent without managing servers, Docker configs, or SSL certificates.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-8">
            <Zap className="size-6 text-neutral-900" strokeWidth={1.5} />
            <h3 className="mt-4 text-[16px] font-bold text-neutral-900">60-Second Deploy</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-neutral-500">
              From signup to a live AI agent accessible over 20+ channels — WhatsApp, Telegram, Discord, and more. One click. Your own server. Full control.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-8">
            <Globe className="size-6 text-neutral-900" strokeWidth={1.5} />
            <h3 className="mt-4 text-[16px] font-bold text-neutral-900">Global Infrastructure</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-neutral-500">
              Powered by Hetzner Cloud with data centers in Germany and Finland. Automatic HTTPS, DNS management, and firewall configuration included.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-8">
            <Users className="size-6 text-neutral-900" strokeWidth={1.5} />
            <h3 className="mt-4 text-[16px] font-bold text-neutral-900">Built for Teams</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-neutral-500">
              Whether you&apos;re a solo creator, a startup, or an agency managing multiple clients — FireClaw scales from 1 to 100 agents with simple plan upgrades.
            </p>
          </div>
        </div>

        <div className="mt-16 rounded-2xl bg-neutral-900 p-10 text-center">
          <h2 className="text-[20px] font-black text-white">Powered by OpenClaw</h2>
          <p className="mx-auto mt-3 max-w-lg text-[14px] leading-relaxed text-neutral-400">
            FireClaw deploys the OpenClaw engine — an open-source AI gateway that connects your LLM to WhatsApp, Telegram, Discord, Slack, and 20+ messaging channels through a single endpoint.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
