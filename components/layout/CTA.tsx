"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { Particles } from "@/components/ui/particles"

export function CTA() {
  return (
    <section className="relative bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6">
        <BlurFade inView delay={0}>
          <div className="relative overflow-hidden rounded-3xl bg-neutral-950 px-8 py-20 text-center sm:px-16">
            {/* Particles background */}
            <Particles
              className="absolute inset-0 z-0"
              quantity={60}
              color="#f97316"
              staticity={40}
              ease={60}
              size={0.5}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-6">
              <h2 className="text-[36px] font-black leading-[1.1] tracking-[-0.03em] text-white sm:text-[44px] lg:text-[52px]">
                Ready to deploy?
              </h2>
              <p className="max-w-md text-[16px] leading-relaxed text-neutral-400">
                Your private AI server is 60 seconds away. No credit card needed to start.
              </p>

              <div className="flex flex-col items-center gap-3 sm:flex-row">
                <Link href="/dashboard">
                  <ShimmerButton
                    shimmerColor="#f97316"
                    shimmerSize="0.08em"
                    background="rgba(249, 115, 22, 1)"
                    className="px-8 py-4 text-[15px] font-semibold"
                  >
                    <span className="flex items-center gap-2">
                      Deploy OpenClaw
                      <ArrowRight className="size-4" />
                    </span>
                  </ShimmerButton>
                </Link>
                <Link
                  href="#pricing"
                  className="text-[14px] font-medium text-neutral-500 transition-colors hover:text-neutral-300"
                >
                  View pricing →
                </Link>
              </div>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
