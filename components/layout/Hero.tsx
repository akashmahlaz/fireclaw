import Link from "next/link";
import { Flame } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { Badge } from "@/components/ui/badge";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative flex min-h-[85vh] w-full items-center justify-center overflow-hidden bg-background px-4 py-20">
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.15}
        duration={6}
        repeatDelay={1}
        className="text-foreground/10"
      />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
        <BlurFade inView delay={0}>
          <Badge variant="outline" className="gap-1.5 px-3 py-1">
            <Flame className="size-3 text-orange-500" />
            Now in Early Access
          </Badge>
        </BlurFade>

        <BlurFade inView delay={0.1}>
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Deploy & Manage
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              AI Agents at Scale
            </span>
          </h1>
        </BlurFade>

        <BlurFade inView delay={0.2}>
          <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
            One dashboard to deploy, monitor, and manage multiple AI agents.
            Built for agencies and teams who need more than a single chatbot.
          </p>
        </BlurFade>

        <BlurFade inView delay={0.3}>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Link href="/login">
              <ShimmerButton className="gap-2 px-8 py-3 text-base font-medium">
                Start Deploying
                <ArrowRight className="size-4" />
              </ShimmerButton>
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              See how it works →
            </Link>
          </div>
        </BlurFade>

        <BlurFade inView delay={0.4}>
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-green-500" /> 99.9% Uptime
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-green-500" /> &lt;60s Deploy
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-green-500" /> Starts at ₹499/mo
            </span>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
