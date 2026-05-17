"use client"

import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { FIRECLAW_PLANS } from "@/lib/agent-catalog"
import { BlurFade } from "@/components/ui/blur-fade"
import { cn } from "@/lib/utils"

export function Pricing() {
  return (
    <section id="pricing" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <BlurFade inView delay={0}>
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[3px] text-neutral-400">Pricing</p>
            <h2 className="text-[34px] font-black leading-[1.1] tracking-[-0.03em] text-neutral-950 sm:text-[46px]">
              Pay for deployed agents, not infrastructure choices.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-neutral-600">
              Every plan includes managed MiniMax access with usage limits. Claude, OpenAI, or BYO keys are upgrade paths for teams that need them.
            </p>
          </div>
        </BlurFade>

        <div className="grid gap-5 lg:grid-cols-4">
          {FIRECLAW_PLANS.map((plan, index) => (
            <BlurFade key={plan.id} inView delay={0.05 * index}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-xl border p-5 shadow-sm",
                  plan.highlighted ? "border-orange-300 bg-orange-50" : "border-neutral-200 bg-white",
                )}
              >
                {plan.highlighted && (
                  <span className="mb-3 w-fit rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    Popular
                  </span>
                )}
                <h3 className="text-[18px] font-bold text-neutral-950">{plan.name}</h3>
                <p className="mt-2 min-h-10 text-[13px] leading-relaxed text-neutral-600">{plan.description}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-[34px] font-black tracking-[-0.04em] text-neutral-950">{plan.price}</span>
                  <span className="text-[12px] font-medium text-neutral-500">{plan.period}</span>
                </div>
                <div className="mt-4 rounded-lg bg-white/80 p-3 text-[12px] font-semibold text-neutral-700">
                  {plan.agentLimit >= 100 ? "Custom deploy limit" : `${plan.agentLimit} deployed agent${plan.agentLimit > 1 ? "s" : ""}`}
                </div>
                <p className="mt-3 text-[12px] font-medium text-orange-700">{plan.includedAiCredits}</p>
                <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-[13px] text-neutral-600">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.id === "custom" ? "/contact" : "/auth/signin"}
                  className={cn(
                    "mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[13px] font-semibold transition",
                    plan.highlighted
                      ? "bg-neutral-950 text-white hover:bg-neutral-800"
                      : "border border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300 hover:bg-neutral-50",
                  )}
                >
                  {plan.id === "custom" ? "Talk to us" : "Start deploying"}
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  )
}
