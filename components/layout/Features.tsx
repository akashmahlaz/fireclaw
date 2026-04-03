"use client"

import { BlurFade } from "@/components/ui/blur-fade"
import {
  Zap,
  LayoutDashboard,
  Globe2,
  Gauge,
  Lock,
  Terminal,
} from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "One-Click Deploy",
    description:
      "Pick a tier and region — we provision a dedicated VPS, configure DNS, issue SSL, and run health checks. Your OpenClaw instance is live in under 60 seconds.",
  },
  {
    icon: LayoutDashboard,
    title: "Multi-Agent Dashboard",
    description:
      "Deploy and manage multiple AI agents from a single place. Monitor status, restart containers, and scale — designed for agencies running agents for clients.",
  },
  {
    icon: Globe2,
    title: "6+ Global Locations",
    description:
      "Falkenstein, Nuremberg, Helsinki, Ashburn, Hillsboro, Singapore — with real-time availability from the Hetzner API. AWS regions coming soon.",
  },
  {
    icon: Gauge,
    title: "4 Performance Tiers",
    description:
      "From Starter (2 vCPU, 4 GB) to Enterprise (16+ vCPU, 32 GB). Pricing pulled live from the provider so you always get the cheapest available type.",
  },
  {
    icon: Lock,
    title: "Auto SSL & Custom Domains",
    description:
      "Every agent gets a fireclaw.ai subdomain with auto-provisioned TLS via Caddy. Bring your own domain — we handle the Cloudflare DNS record.",
  },
  {
    icon: Terminal,
    title: "Full Root SSH Access",
    description:
      "Every agent runs on a dedicated VPS you fully control. SSH in, install packages, run scripts, tweak configs — it's your server.",
  },
]

export function Features() {
  return (
    <section id="features" className="relative bg-neutral-950 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <BlurFade inView delay={0}>
          <div className="mb-20 text-center">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[3px] text-neutral-500">
              Platform
            </p>
            <h2 className="text-[36px] font-black leading-[1.1] tracking-[-0.03em] text-white sm:text-[44px] lg:text-[52px]">
              Infrastructure, handled.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-neutral-400">
              FireClaw provisions and manages the servers so you can focus on
              building your AI agent — not debugging cloud consoles.
            </p>
          </div>
        </BlurFade>

        {/* Feature list — clean two-column layout */}
        <div className="grid grid-cols-1 gap-x-16 gap-y-12 sm:grid-cols-2">
          {features.map((feature, i) => (
            <BlurFade key={feature.title} inView delay={0.05 * i}>
              <div className="flex gap-4">
                {/* Icon */}
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-neutral-800">
                  <feature.icon className="size-5 text-neutral-300" />
                </div>

                {/* Text */}
                <div>
                  <h3 className="mb-1.5 text-[15px] font-bold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-[14px] leading-relaxed text-neutral-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  )
}
