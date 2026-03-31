import Link from "next/link"
import { ArrowRight, Shield, Clock, Zap, Globe } from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text"
import { DotPattern } from "@/components/ui/dot-pattern"
import { NumberTicker } from "@/components/ui/number-ticker"
import { BorderBeam } from "@/components/ui/border-beam"
import { Safari } from "@/components/ui/safari"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative flex min-h-[92vh] w-full flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-16">
      {/* Subtle dot background with radial mask */}
      <DotPattern className="absolute inset-0 text-foreground/4 mask-[radial-gradient(700px_circle_at_center,white,transparent)]" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
        {/* Announcement badge */}
        <BlurFade inView delay={0}>
          <div className="group inline-flex items-center rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm backdrop-blur-sm transition-all hover:border-border hover:bg-muted">
            <AnimatedShinyText className="inline-flex items-center gap-2">
              <span className="size-1.5 animate-pulse rounded-full bg-green-500" />
              Now in Early Access — Deploy your OpenClaw today
              <ArrowRight className="ml-1 size-3 transition-transform group-hover:translate-x-0.5" />
            </AnimatedShinyText>
          </div>
        </BlurFade>

        {/* Heading */}
        <BlurFade inView delay={0.1}>
          <h1 className="max-w-4xl font-heading text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Your Personal AI Assistant,{" "}
            <span className="bg-linear-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent">
              Deployed in Seconds
            </span>
          </h1>
        </BlurFade>

        {/* Subtitle */}
        <BlurFade inView delay={0.2}>
          <p className="max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
            One click to launch OpenClaw on a dedicated VPS.
            Connect WhatsApp, Telegram, Discord &mdash; all channels,
            full control, your rules.
          </p>
        </BlurFade>

        {/* CTAs */}
        <BlurFade inView delay={0.3}>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Link href="/dashboard">
              <ShimmerButton
                className="gap-2.5 px-8 py-3 text-base font-semibold"
                background="linear-gradient(135deg, #f97316, #dc2626)"
                shimmerColor="rgba(255,255,255,0.25)"
              >
                Deploy My OpenClaw
                <ArrowRight className="size-4" />
              </ShimmerButton>
            </Link>
            <Link
              href="#how-it-works"
              className="group flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              See how it works
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </BlurFade>

        {/* Trust indicators */}
        <BlurFade inView delay={0.35}>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Shield className="size-4 text-green-600" />
              99.9% Uptime
            </span>
            <span className="flex items-center gap-2">
              <Clock className="size-4 text-orange-500" />
              &lt;60s Deploy
            </span>
            <span className="flex items-center gap-2">
              <Zap className="size-4 text-blue-500" />
              From $7.99/mo
            </span>
            <span className="flex items-center gap-2">
              <Globe className="size-4 text-violet-500" />
              3 Regions
            </span>
          </div>
        </BlurFade>

        {/* Product mockup */}
        <BlurFade inView delay={0.4}>
          <div className="relative mt-6 w-full max-w-4xl">
            <div className="relative overflow-hidden rounded-xl border border-border/50 bg-muted/20 shadow-2xl shadow-black/8">
              <Safari
                url="fireclaw.ai/dashboard"
                mode="default"
                className="w-full"
              />
              <BorderBeam
                size={200}
                duration={8}
                colorFrom="#f97316"
                colorTo="#dc2626"
                borderWidth={1.5}
              />
            </div>
            {/* Fade out at bottom */}
            <div className="pointer-events-none absolute -inset-x-20 -bottom-8 h-32 bg-linear-to-t from-background via-background/80 to-transparent" />
          </div>
        </BlurFade>

        {/* Stats */}
        <BlurFade inView delay={0.5}>
          <div className="grid grid-cols-2 gap-8 pt-4 sm:grid-cols-4 sm:gap-12">
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                <NumberTicker value={342} />k+
              </span>
              <span className="text-xs text-muted-foreground sm:text-sm">
                GitHub Stars
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                <NumberTicker value={20} />+
              </span>
              <span className="text-xs text-muted-foreground sm:text-sm">
                Channels
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                &lt;<NumberTicker value={60} />s
              </span>
              <span className="text-xs text-muted-foreground sm:text-sm">
                Deploy Time
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                <NumberTicker value={4} />
              </span>
              <span className="text-xs text-muted-foreground sm:text-sm">
                VPS Tiers
              </span>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
