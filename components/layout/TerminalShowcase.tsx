"use client"

import { BlurFade } from "@/components/ui/blur-fade"
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/ui/terminal"

export function TerminalShowcase() {
  return (
    <section className="relative bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <BlurFade inView delay={0}>
          <div className="mb-14 text-center">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[3px] text-neutral-400">
              Deploy
            </p>
            <h2 className="text-[36px] font-black leading-[1.1] tracking-[-0.03em] text-neutral-900 sm:text-[44px] lg:text-[52px]">
              From zero to live
              <br />
              <span className="text-neutral-400">in one command.</span>
            </h2>
          </div>
        </BlurFade>

        {/* Full-width terminal */}
        <BlurFade inView delay={0.1}>
          <Terminal
            className="mx-auto w-full !max-w-5xl !max-h-none rounded-2xl !border-neutral-800 !bg-neutral-950 shadow-2xl shadow-neutral-900/25"
          >
            <TypingAnimation className="text-green-400">
              {"> fireclaw deploy --tier standard --region eu-central"}
            </TypingAnimation>

            <AnimatedSpan className="text-neutral-500">
              <span>  Authenticating with Fireclaw Cloud...</span>
            </AnimatedSpan>

            <AnimatedSpan className="text-emerald-400">
              <span>  ✓ Authenticated as akash@fireclaw.ai</span>
            </AnimatedSpan>

            <AnimatedSpan className="text-neutral-500">
              <span>  Provisioning dedicated VPS from snapshot...</span>
            </AnimatedSpan>

            <AnimatedSpan className="text-emerald-400">
              <span>  ✓ VPS created — cx32 · 4 vCPU · 8 GB RAM · 160 GB NVMe</span>
            </AnimatedSpan>

            <AnimatedSpan className="text-emerald-400">
              <span>  ✓ Firewall rules applied (SSH + HTTPS only)</span>
            </AnimatedSpan>

            <AnimatedSpan className="text-emerald-400">
              <span>  ✓ DNS record → akash-7x2f.fireclaw.ai</span>
            </AnimatedSpan>

            <AnimatedSpan className="text-emerald-400">
              <span>  ✓ SSL certificate issued via Let's Encrypt</span>
            </AnimatedSpan>

            <AnimatedSpan className="text-emerald-400">
              <span>  ✓ OpenClaw engine started on :18789</span>
            </AnimatedSpan>

            <AnimatedSpan className="text-emerald-400">
              <span>  ✓ Health check passed (200 OK)</span>
            </AnimatedSpan>

            <AnimatedSpan className="text-neutral-600">
              <span>  ─────────────────────────────────────────</span>
            </AnimatedSpan>

            <AnimatedSpan className="text-white font-semibold">
              <span>  🚀 Your OpenClaw is live!</span>
            </AnimatedSpan>

            <AnimatedSpan className="text-orange-400">
              <span>  → https://akash-7x2f.fireclaw.ai</span>
            </AnimatedSpan>

            <AnimatedSpan className="text-neutral-500">
              <span>  Deploy time: 47s · Region: eu-central · Status: healthy</span>
            </AnimatedSpan>

            <TypingAnimation className="text-neutral-600">
              {"  Ready to connect channels. Run `fireclaw connect --help`"}
            </TypingAnimation>
          </Terminal>
        </BlurFade>
      </div>
    </section>
  )
}
