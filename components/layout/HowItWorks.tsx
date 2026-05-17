"use client"

import { Bot, CheckCircle2, CreditCard, Rocket, ShieldCheck } from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"

const steps = [
  {
    icon: Bot,
    title: "Select the business job",
    description: "Start from a support, research, document, content, commerce, or analyst template with a clear operating scope.",
  },
  {
    icon: CreditCard,
    title: "Set capacity and controls",
    description: "Pick the plan, usage limits, model route, channels, and escalation rules without exposing cloud complexity.",
  },
  {
    icon: Rocket,
    title: "Launch into managed operations",
    description: "FireClaw provisions the runtime, attaches managed AI access, configures SSL, and monitors health after deploy.",
  },
]

const operatingSignals = [
  "Runtime selected",
  "Managed model attached",
  "SSL issued",
  "Health check passed",
  "Usage guardrails active",
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-neutral-200 bg-neutral-50 py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.85fr_1.15fr]">
        <BlurFade inView delay={0}>
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[3px] text-neutral-500">Operating model</p>
            <h2 className="max-w-xl text-[34px] font-black leading-[1.1] text-neutral-950 sm:text-[46px]">
              The user sees workflow choices. FireClaw handles the platform work.
            </h2>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-neutral-600">
              Big-company landing pages do not explain every feature at once. They show a system buyers can trust: what gets configured, what gets controlled, and what happens after launch.
            </p>
          </div>
        </BlurFade>

        <div className="grid gap-5">
          {steps.map((step, index) => (
            <BlurFade key={step.title} inView delay={0.08 * index}>
              <div className="grid gap-5 border border-neutral-200 bg-white p-5 shadow-sm md:grid-cols-[auto_1fr_auto] md:items-center">
                <div className="flex size-11 items-center justify-center bg-neutral-950 text-white">
                  <step.icon className="size-5" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-neutral-400">Step 0{index + 1}</p>
                  <h3 className="mt-1 text-[19px] font-bold text-neutral-950">{step.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-neutral-600">{step.description}</p>
                </div>
                <div className="hidden min-w-32 border-l border-neutral-200 pl-5 text-[12px] font-semibold text-emerald-700 md:block">
                  Operationalized
                </div>
              </div>
            </BlurFade>
          ))}

          <BlurFade inView delay={0.28}>
            <div className="border border-neutral-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2 text-[13px] font-bold text-neutral-950">
                <ShieldCheck className="size-4 text-emerald-600" />
                Launch checklist
              </div>
              <div className="grid gap-3 sm:grid-cols-5">
                {operatingSignals.map((signal) => (
                  <div key={signal} className="flex items-center gap-2 text-[12px] font-medium text-neutral-600">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                    {signal}
                  </div>
                ))}
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  )
}
