import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"
import { DeployTerminal } from "@/components/layout/DeployTerminal"

const channelLogos = [
  { name: "WhatsApp", color: "#25D366", letter: "W" },
  { name: "Telegram", color: "#26A5E4", letter: "T" },
  { name: "Discord",  color: "#5865F2", letter: "D" },
  { name: "Slack",    color: "#4A154B", letter: "S" },
  { name: "Signal",   color: "#3A76F0", letter: "Si" },
  { name: "iMessage", color: "#34C759", letter: "iM" },
]

export function Hero() {
  return (
    <section className="relative flex min-h-[92vh] w-full flex-col items-center justify-center overflow-hidden bg-white px-6 pt-20 pb-16">
      {/* Faint radial glow — barely visible, purely warm */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[40%] h-125 w-175 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at center, #fed7aa 0%, #fef3c7 40%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
        {/* Badge */}
        <BlurFade inView delay={0}>
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-1.5 shadow-sm">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-[12px] font-semibold tracking-wide text-neutral-600">
              Early Access — Limited spots available
            </span>
          </div>
        </BlurFade>

        {/* Headline — monumental typography */}
        <BlurFade inView delay={0.08}>
          <h1 className="max-w-[18ch] text-[52px] font-black leading-[1.04] tracking-[-0.04em] text-neutral-900 sm:text-[68px] md:text-[80px] lg:text-[92px]">
            Your AI assistant,{" "}
            <span className="text-orange-500">deployed in seconds.</span>
          </h1>
        </BlurFade>

        {/* Subtitle */}
        <BlurFade inView delay={0.14}>
          <p className="max-w-[52ch] text-balance text-[16px] leading-[1.75] text-neutral-500 sm:text-[18px]">
            One click to run OpenClaw on a dedicated VPS. Connect every channel
            — WhatsApp, Telegram, Discord and more — with full control.
          </p>
        </BlurFade>

        {/* CTA — single dark pill like Legora */}
        <BlurFade inView delay={0.2}>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-3 rounded-full bg-neutral-900 px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-neutral-900/20 transition-all duration-300 hover:bg-neutral-700 hover:shadow-neutral-900/30 active:scale-[0.97]"
            >
              Deploy my OpenClaw
              <span className="flex size-5 items-center justify-center rounded-full bg-white/15 transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="size-3" />
              </span>
            </Link>
            <Link
              href="#how-it-works"
              className="text-[14px] font-medium text-neutral-400 transition-colors hover:text-neutral-700"
            >
              See how it works →
            </Link>
          </div>
        </BlurFade>

        {/* Social proof strip */}
        <BlurFade inView delay={0.26}>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] font-medium text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-green-500" />
              Dedicated VPS — not shared
            </span>
            <span className="hidden h-3 w-px bg-neutral-200 sm:block" />
            <span>From $7.99/mo</span>
            <span className="hidden h-3 w-px bg-neutral-200 sm:block" />
            <span>&lt;60s deploy time</span>
            <span className="hidden h-3 w-px bg-neutral-200 sm:block" />
            <span>3 regions</span>
          </div>
        </BlurFade>

        {/* Terminal mockup */}
        <BlurFade inView delay={0.32}>
          <div className="mt-4 w-full max-w-2xl overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-950 shadow-2xl shadow-neutral-900/25">
            {/* Window chrome */}
            <div className="flex items-center gap-1.5 border-b border-white/5 bg-neutral-900 px-4 py-3">
              <span className="size-3 rounded-full bg-red-500/70" />
              <span className="size-3 rounded-full bg-yellow-500/70" />
              <span className="size-3 rounded-full bg-green-500/70" />
              <span className="ml-3 flex-1 text-center text-[11px] font-medium text-neutral-500">
                fireclaw.ai/dashboard
              </span>
            </div>
            <DeployTerminal />
          </div>
        </BlurFade>

        {/* Works with — channel logos */}
        <BlurFade inView delay={0.38}>
          <div className="flex flex-col items-center gap-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-400">
              Works with
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {channelLogos.map((ch) => (
                <div
                  key={ch.name}
                  title={ch.name}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-100 bg-white text-[11px] font-bold shadow-sm transition-transform hover:scale-110"
                  style={{ color: ch.color }}
                >
                  {ch.letter}
                </div>
              ))}
              <span className="text-[12px] font-medium text-neutral-400">+14 more</span>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
