"use client"

import { forwardRef, useRef } from "react"
import {
  Server,
  Zap,
  Shield,
  Globe2,
  Plug,
} from "lucide-react"
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid"
import { AnimatedBeam } from "@/components/ui/animated-beam"
import { AnimatedListItem, AnimatedList } from "@/components/ui/animated-list"
import { Globe } from "@/components/ui/globe"
import { Marquee } from "@/components/ui/marquee"
import { cn } from "@/lib/utils"

/* ── Background: Animated deploy notifications ── */
function DeployNotifications() {
  const notifications = [
    { name: "VPS Provisioned", time: "just now", icon: "🖥️", color: "#10b981" },
    { name: "SSL Certificate", time: "2s ago", icon: "🔒", color: "#f59e0b" },
    { name: "DNS Configured", time: "5s ago", icon: "🌐", color: "#3b82f6" },
    { name: "Health Check OK", time: "8s ago", icon: "✅", color: "#10b981" },
    { name: "WhatsApp Connected", time: "12s ago", icon: "💬", color: "#25d366" },
    { name: "Telegram Linked", time: "15s ago", icon: "📱", color: "#26a5e4" },
  ]

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden p-4 [mask-image:linear-gradient(to_top,transparent_10%,#000_70%)]">
      <AnimatedList delay={2000}>
        {notifications.map((n, i) => (
          <AnimatedListItem key={i}>
            <div className="mx-auto flex w-full max-w-[260px] items-center gap-3 rounded-lg border border-neutral-100 bg-white px-3 py-2 shadow-sm">
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[14px]"
                style={{ backgroundColor: `${n.color}15` }}
              >
                {n.icon}
              </span>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-[12px] font-semibold text-neutral-800">
                  {n.name}
                </p>
                <p className="text-[10px] text-neutral-400">{n.time}</p>
              </div>
            </div>
          </AnimatedListItem>
        ))}
      </AnimatedList>
    </div>
  )
}

/* ── Background: Channel connection beams ── */
const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => (
  <div
    ref={ref}
    className={cn(
      "z-10 flex size-10 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm",
      className
    )}
  >
    {children}
  </div>
))
Circle.displayName = "Circle"

function ChannelBeams() {
  const containerRef = useRef<HTMLDivElement>(null)
  const waRef = useRef<HTMLDivElement>(null)
  const tgRef = useRef<HTMLDivElement>(null)
  const dcRef = useRef<HTMLDivElement>(null)
  const centerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-center overflow-hidden p-6 [mask-image:linear-gradient(to_top,transparent_5%,#000_60%)]"
    >
      <div className="flex h-full w-full max-w-[280px] items-center justify-between">
        <div className="flex flex-col items-center gap-8">
          <Circle ref={waRef}>
            <span className="text-[14px]">💬</span>
          </Circle>
          <Circle ref={tgRef}>
            <span className="text-[14px]">📱</span>
          </Circle>
          <Circle ref={dcRef}>
            <span className="text-[14px]">🎮</span>
          </Circle>
        </div>

        <Circle ref={centerRef} className="size-14 border-2 border-orange-200 bg-orange-50">
          <span className="text-[12px] font-black text-orange-600">FC</span>
        </Circle>
      </div>

      <AnimatedBeam containerRef={containerRef} fromRef={waRef} toRef={centerRef} curvature={-40} />
      <AnimatedBeam containerRef={containerRef} fromRef={tgRef} toRef={centerRef} />
      <AnimatedBeam containerRef={containerRef} fromRef={dcRef} toRef={centerRef} curvature={40} />
    </div>
  )
}

/* ── Background: Globe with server locations ── */
function ServerGlobe() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden [mask-image:linear-gradient(to_top,transparent_20%,#000_80%)]">
      <Globe className="top-2" />
    </div>
  )
}

/* ── Background: Security marquee ── */
function SecurityMarquee() {
  const items = [
    "End-to-end encrypted",
    "SOC 2 compliant",
    "Dedicated isolation",
    "SSH key-only access",
    "Automated backups",
    "DDoS protection",
    "Zero-trust network",
    "TLS 1.3 everywhere",
  ]
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden px-2 [mask-image:linear-gradient(to_top,transparent_10%,#000_60%)]">
      <Marquee pauseOnHover className="[--duration:25s]">
        {items.slice(0, 4).map((item) => (
          <div
            key={item}
            className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700"
          >
            <Shield className="size-3" />
            {item}
          </div>
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:30s]">
        {items.slice(4).map((item) => (
          <div
            key={item}
            className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700"
          >
            <Shield className="size-3" />
            {item}
          </div>
        ))}
      </Marquee>
    </div>
  )
}

/* ── Feature cards data ── */
const features = [
  {
    Icon: Zap,
    name: "60-Second Deploy",
    description:
      "From sign-up to a live OpenClaw instance — fully provisioned VPS, DNS, SSL, and health check in under a minute.",
    href: "#",
    cta: "See the terminal",
    className: "col-span-3 lg:col-span-1",
    background: <DeployNotifications />,
  },
  {
    Icon: Plug,
    name: "Every Channel Connected",
    description:
      "WhatsApp, Telegram, Discord, Slack — connect any messaging channel to your private instance with one click.",
    href: "#",
    cta: "View channels",
    className: "col-span-3 lg:col-span-2",
    background: <ChannelBeams />,
  },
  {
    Icon: Globe2,
    name: "3 Global Regions",
    description:
      "Deploy to US East, EU Central, or Singapore. Your server, closest to your users.",
    href: "#",
    cta: "Choose region",
    className: "col-span-3 lg:col-span-2",
    background: <ServerGlobe />,
  },
  {
    Icon: Shield,
    name: "Enterprise-Grade Security",
    description:
      "Dedicated VPS isolation, encrypted connections, automated backups, and SSH key-only access.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: <SecurityMarquee />,
  },
  {
    Icon: Server,
    name: "Full Server Control",
    description:
      "Root SSH access, custom configs, your own domain. It's your server — we just make it effortless.",
    href: "#",
    cta: "Explore plans",
    className: "col-span-3",
    background: (
      <div className="absolute inset-0 [mask-image:linear-gradient(to_top,transparent_10%,#000_60%)]">
        <Marquee pauseOnHover className="[--duration:40s] mt-8">
          {["4 vCPU", "8 GB RAM", "160 GB NVMe", "Root SSH", "Custom Domain", "Auto SSL", "Cron Jobs", "API Access", "Webhooks", "Logs"].map((t) => (
            <span
              key={t}
              className="rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-1.5 text-[11px] font-semibold text-neutral-600"
            >
              {t}
            </span>
          ))}
        </Marquee>
      </div>
    ),
  },
]

/* ── Main Section ── */
export function Features() {
  return (
    <section id="features" className="relative bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[3px] text-neutral-400">
            Platform
          </p>
          <h2 className="text-[36px] font-black leading-[1.1] tracking-[-0.03em] text-neutral-900 sm:text-[44px] lg:text-[52px]">
            Everything you need.
            <br />
            <span className="text-neutral-400">Nothing you don&apos;t.</span>
          </h2>
        </div>

        <BentoGrid className="auto-rows-[20rem] lg:grid-cols-3">
          {features.map((f) => (
            <BentoCard key={f.name} {...f} />
          ))}
        </BentoGrid>
      </div>
    </section>
  )
}
