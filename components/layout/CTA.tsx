"use client"

import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"

const intakeItems = [
  "Business process and success metric",
  "Channels, data sources, and integrations",
  "Budget, timeline, and required model quality",
]

export function CTA() {
  return (
    <section id="custom-agents" className="bg-neutral-950 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <BlurFade inView delay={0}>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[3px] text-orange-300">Custom agents</p>
              <h2 className="max-w-2xl text-[36px] font-black leading-[1.08] tracking-[-0.03em] text-white sm:text-[50px]">
                We also build agents around your actual workflow.
              </h2>
              <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-neutral-300">
                If a template is not enough, FireClaw can design and deploy a custom agent for your team, including prompt design, tools, data connections, and rollout support.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3.5 text-[14px] font-semibold text-white transition hover:bg-orange-600"
                >
                  Request custom agent
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-[14px] font-semibold text-white transition hover:bg-white/10"
                >
                  Deploy template
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
              <h3 className="text-[16px] font-bold text-white">Custom build intake</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-neutral-400">
                The first version routes these requests to the FireClaw team. Automation can come after the service motion is clear.
              </p>
              <div className="mt-6 space-y-3">
                {intakeItems.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-lg bg-white/[0.04] p-3">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    <span className="text-[13px] font-medium text-neutral-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
