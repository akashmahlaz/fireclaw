"use client"

import { BlurFade } from "@/components/ui/blur-fade"
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/ui/terminal"
import { useTerminalSounds } from "@/hooks/use-terminal-sounds"

export function TerminalShowcase() {
  const { playSound } = useTerminalSounds()

  return (
    <section className="relative bg-white py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <BlurFade inView delay={0}>
          <div className="mb-16 text-center">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[3px] text-neutral-400">
              Deploy
            </p>
            <h2 className="text-[36px] font-black leading-[1.1] tracking-[-0.03em] text-neutral-900 sm:text-[44px] lg:text-[52px]">
              From zero to live
              <br />
              <span className="text-neutral-400">in one command.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-neutral-500">
              A single command provisions a dedicated server, configures
              networking, deploys OpenClaw, and verifies the health — all in
              under 60 seconds.
            </p>
          </div>
        </BlurFade>

        {/* Terminal */}
        <BlurFade inView delay={0.1}>
          <Terminal className="mx-auto max-w-5xl rounded-2xl border-neutral-200 bg-neutral-950 shadow-2xl shadow-neutral-900/20">
            <TypingAnimation
              className="text-green-400 font-semibold mb-2"
              onCharTyped={() => playSound("keystroke")}
            >
              {"$ fireclaw deploy --tier standard --region eu-central"}
            </TypingAnimation>

            <AnimatedSpan
              className="text-neutral-500 font-bold mb-1"
              onAppear={() => playSound("phase")}
            >
              <span>  [1/4] Authentication & Capacity</span>
            </AnimatedSpan>
            <AnimatedSpan className="text-neutral-500">
              <span>  → Authenticated as akash@fireclaw.ai (workspace: default)</span>
            </AnimatedSpan>
            <AnimatedSpan
              className="text-emerald-400 mb-2"
              onAppear={() => playSound("success")}
            >
              <span>  ✓ Capacity reserved in eu-central isolated pool</span>
            </AnimatedSpan>

            <AnimatedSpan
              className="text-neutral-500 font-bold mb-1"
              onAppear={() => playSound("phase")}
            >
              <span>  [2/4] Provisioning Infrastructure</span>
            </AnimatedSpan>
            <AnimatedSpan className="text-neutral-500">
              <span>  → Booting dedicated instance from secure OS snapshot...</span>
            </AnimatedSpan>
            <AnimatedSpan
              className="text-emerald-400 mb-2"
              onAppear={() => playSound("success")}
            >
              <span>  ✓ Dedicated VPS running (CX33 · 4 vCPU · 8 GB RAM)</span>
            </AnimatedSpan>

            <AnimatedSpan
              className="text-neutral-500 font-bold mb-1"
              onAppear={() => playSound("phase")}
            >
              <span>  [3/4] Security & Routing</span>
            </AnimatedSpan>
            <AnimatedSpan className="text-neutral-500">
              <span>  → Allocating static IPv4/IPv6 block...</span>
            </AnimatedSpan>
            <AnimatedSpan
              className="text-emerald-400"
              onAppear={() => playSound("success")}
            >
              <span>  ✓ DNS successfully propagated (akash-7x2f.fireclaw.ai)</span>
            </AnimatedSpan>
            <AnimatedSpan
              className="text-emerald-400 mb-2"
              onAppear={() => playSound("success")}
            >
              <span>  ✓ TLS/SSL certificate issued and verified</span>
            </AnimatedSpan>

            <AnimatedSpan
              className="text-neutral-500 font-bold mb-1"
              onAppear={() => playSound("phase")}
            >
              <span>  [4/4] Deploying OpenClaw Core</span>
            </AnimatedSpan>
            <AnimatedSpan className="text-neutral-500">
              <span>  → Pulling openclaw/engine:v2.1.0 registry image...</span>
            </AnimatedSpan>
            <AnimatedSpan className="text-neutral-500">
              <span>  → Initializing secure Postgres vector database...</span>
            </AnimatedSpan>
            <AnimatedSpan
              className="text-emerald-400"
              onAppear={() => playSound("success")}
            >
              <span>  ✓ Gateway services booted on :18789</span>
            </AnimatedSpan>
            <AnimatedSpan
              className="text-emerald-400 mb-3"
              onAppear={() => playSound("success")}
            >
              <span>  ✓ Health check passed (HTTP 200 OK)</span>
            </AnimatedSpan>

            <AnimatedSpan className="text-neutral-700">
              <span>  ─────────────────────────────────────────────────────────────</span>
            </AnimatedSpan>

            <AnimatedSpan
              className="text-white font-bold text-[15px] mt-1"
              onAppear={() => playSound("deploy")}
            >
              <span>  🚀 Your OpenClaw instance is live!</span>
            </AnimatedSpan>
            <AnimatedSpan className="text-orange-400 font-medium mb-1">
              <span>  → https://akash-7x2f.fireclaw.ai</span>
            </AnimatedSpan>

            <AnimatedSpan className="text-neutral-500">
              <span>  Deploy time: 47.3s · Uptime SLA: 99.99% · Status: Healthy</span>
            </AnimatedSpan>

            <TypingAnimation
              className="text-neutral-600 mt-2"
              onCharTyped={() => playSound("keystroke")}
            >
              {"  Next step: run `fireclaw connect whatsapp`"}
            </TypingAnimation>
          </Terminal>
        </BlurFade>
      </div>
    </section>
  )
}
