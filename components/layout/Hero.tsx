import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"

export function Hero() {
  return (
    <section className="relative flex min-h-[92vh] w-full flex-col items-center justify-center overflow-hidden bg-white px-6 pt-20 pb-24">
      {/* Faint radial glow */}
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

        {/* Headline */}
        <BlurFade inView delay={0.08}>
          <h1 className="max-w-[18ch] text-[52px] font-black leading-[1.04] tracking-[-0.04em] text-neutral-900 sm:text-[68px] md:text-[80px] lg:text-[92px]">
            One message.{" "}
            <span className="text-orange-500">Infinite control.</span>
          </h1>
        </BlurFade>

        {/* Subtitle */}
        <BlurFade inView delay={0.14}>
          <p className="max-w-[52ch] text-balance text-[16px] leading-[1.75] text-neutral-500 sm:text-[18px]">
            Deploy a private AI server in 60 seconds. Own the infrastructure.
            Connect every channel. Scale without asking permission.
          </p>
        </BlurFade>

        {/* CTA */}
        <BlurFade inView delay={0.2}>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-3 rounded-full bg-neutral-900 px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-neutral-900/20 transition-all duration-300 hover:bg-neutral-700 hover:shadow-neutral-900/30 active:scale-[0.97]"
            >
              Deploy Now
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
      </div>
    </section>
  )
}
