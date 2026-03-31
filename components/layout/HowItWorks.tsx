"use client"

import { BlurFade } from "@/components/ui/blur-fade"
import { MagicCard } from "@/components/ui/magic-card"
import { UserPlus, CreditCard, Rocket } from "lucide-react"

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Create your account",
    description:
      "Sign up with Google or email. No credit card required to explore the dashboard.",
  },
  {
    step: "02",
    icon: CreditCard,
    title: "Pick a plan",
    description:
      "Choose from 4 VPS tiers — Starter to Enterprise. Pay monthly, cancel anytime.",
  },
  {
    step: "03",
    icon: Rocket,
    title: "Deploy in 60 seconds",
    description:
      "Select a region, hit deploy. Your private OpenClaw instance is live with SSL, DNS, and health checks.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-neutral-50 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <BlurFade inView delay={0}>
          <div className="mb-14 text-center">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[3px] text-neutral-400">
              How it works
            </p>
            <h2 className="text-[36px] font-black leading-[1.1] tracking-[-0.03em] text-neutral-900 sm:text-[44px] lg:text-[52px]">
              Three steps.
              <br />
              <span className="text-neutral-400">That&apos;s it.</span>
            </h2>
          </div>
        </BlurFade>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <BlurFade key={s.step} inView delay={0.08 * i}>
              <MagicCard
                className="flex h-full flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm"
                gradientSize={200}
                gradientColor="#fdba7420"
              >
                {/* Step number */}
                <div className="flex items-center gap-3">
                  <span className="text-[42px] font-black leading-none tracking-[-0.06em] text-orange-500/20">
                    {s.step}
                  </span>
                  <s.icon className="size-6 text-neutral-700" strokeWidth={1.5} />
                </div>

                <h3 className="text-[20px] font-bold text-neutral-900">
                  {s.title}
                </h3>
                <p className="text-[14px] leading-relaxed text-neutral-500">
                  {s.description}
                </p>
              </MagicCard>
            </BlurFade>
          ))}
        </div>

        {/* Connector line — desktop only */}
        <div className="mx-auto mt-10 hidden max-w-md items-center justify-center gap-2 md:flex">
          <div className="h-0.5 flex-1 rounded-full bg-neutral-200" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
            You&apos;re live
          </span>
          <div className="h-0.5 flex-1 rounded-full bg-neutral-200" />
        </div>
      </div>
    </section>
  )
}
