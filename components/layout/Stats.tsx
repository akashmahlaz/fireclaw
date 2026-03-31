"use client"

import { BlurFade } from "@/components/ui/blur-fade"
import { NumberTicker } from "@/components/ui/number-ticker"
import { BorderBeam } from "@/components/ui/border-beam"

const stats = [
  { value: 60, suffix: "s", label: "Average deploy time" },
  { value: 99.9, suffix: "%", label: "Uptime SLA", decimalPlaces: 1 },
  { value: 20, suffix: "+", label: "Channels supported" },
  { value: 3, suffix: "", label: "Global regions" },
]

export function Stats() {
  return (
    <section className="relative bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <BlurFade inView delay={0}>
          <div className="mb-14 text-center">
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

        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <BlurFade key={stat.label} inView delay={0.05 * i}>
              <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm sm:p-8">
                <div className="text-[40px] font-black leading-none tracking-[-0.04em] text-neutral-900 sm:text-[52px]">
                  <NumberTicker
                    value={stat.value}
                    decimalPlaces={stat.decimalPlaces ?? 0}
                  />
                  <span className="text-orange-500">{stat.suffix}</span>
                </div>
                <p className="mt-3 text-[13px] font-medium text-neutral-500">
                  {stat.label}
                </p>
                <BorderBeam
                  size={120}
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
