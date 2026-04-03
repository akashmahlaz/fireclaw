"use client"

import { BlurFade } from "@/components/ui/blur-fade"
import { NumberTicker } from "@/components/ui/number-ticker"
import { BorderBeam } from "@/components/ui/border-beam"
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar"
import { Clock, Shield, MessageSquare, Globe2 } from "lucide-react"

const supportingStats = [
  {
    value: 60,
    suffix: "s",
    label: "Average deploy time",
    icon: Clock,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-100",
  },
  {
    value: 20,
    suffix: "+",
    label: "Channels supported",
    icon: MessageSquare,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100",
  },
  {
    value: 3,
    suffix: "",
    label: "Global regions",
    icon: Globe2,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-100",
  },
]

export function Stats() {
  return (
    <section className="relative bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <BlurFade inView delay={0}>
          <div className="mb-16 text-center">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[3px] text-neutral-400">
              By the numbers
            </p>
            <h2 className="text-[36px] font-black leading-[1.1] tracking-[-0.03em] text-neutral-900 sm:text-[44px] lg:text-[52px]">
              Built for scale.
              <br />
              <span className="text-neutral-400">Proven in production.</span>
            </h2>
          </div>
        </BlurFade>

        {/* Hero stat: Uptime */}
        <BlurFade inView delay={0.05}>
          <div className="relative mx-auto mb-10 flex max-w-md flex-col items-center overflow-hidden rounded-3xl border border-neutral-200 bg-linear-to-b from-white to-neutral-50 p-8 shadow-sm sm:p-10">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-emerald-50">
                <Shield className="size-4 text-emerald-500" />
              </div>
              <span className="text-[12px] font-semibold uppercase tracking-widest text-neutral-400">
                Uptime SLA
              </span>
            </div>

            <AnimatedCircularProgressBar
              value={99.9}
              max={100}
              gaugePrimaryColor="#f97316"
              gaugeSecondaryColor="#f5f5f5"
              className="size-44 text-4xl font-black text-neutral-900 sm:size-48"
            />

            <p className="mt-3 text-center text-[13px] leading-relaxed text-neutral-500">
              Your agent stays online around the clock.
              <br />
              Guaranteed by infrastructure-level SLA.
            </p>

            <BorderBeam
              size={200}
              duration={10}
              colorFrom="#f97316"
              colorTo="#10b981"
            />
          </div>
        </BlurFade>

        {/* Supporting stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          {supportingStats.map((stat, i) => (
            <BlurFade key={stat.label} inView delay={0.1 + 0.05 * i}>
              <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-8">
                <div className="mx-auto mb-4 flex size-10 items-center justify-center rounded-xl border border-neutral-100 bg-neutral-50">
                  <stat.icon className={`size-5 ${stat.color}`} />
                </div>

                <div className="text-[40px] font-black leading-none tracking-[-0.04em] text-neutral-900 sm:text-[48px]">
                  <NumberTicker
                    value={stat.value}
                  />
                  <span className="text-orange-500">{stat.suffix}</span>
                </div>
                <p className="mt-3 text-[13px] font-medium text-neutral-500">
                  {stat.label}
                </p>

                <BorderBeam
                  size={100}
                  duration={8 + i * 2}
                  colorFrom="#f97316"
                  colorTo="#fbbf24"
                />
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  )
}
