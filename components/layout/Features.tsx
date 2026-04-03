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
import { FlickeringGrid } from "@/components/ui/flickering-grid"
import { DotPattern } from "@/components/ui/dot-pattern"
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
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden p-4 mask-[linear-gradient(to_top,transparent_10%,#000_70%)]">
      <AnimatedList delay={2000}>
        {notifications.map((n, i) => (
          <AnimatedListItem key={i}>
            <div className="mx-auto flex w-full max-w-65 items-center gap-3 rounded-lg border border-neutral-100 bg-white px-3 py-2 shadow-sm">
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
      className="absolute inset-0 flex items-center justify-center overflow-hidden p-6 mask-[linear-gradient(to_top,transparent_5%,#000_60%)]"
    >
      <div className="flex h-full w-full max-w-70 items-center justify-between">
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
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden mask-[linear-gradient(to_top,transparent_20%,#000_80%)]">
      <Globe className="top-2" />
    </div>
  )
}

/* ── Background: Security flickering grid ── */
function SecurityGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden mask-[linear-gradient(to_top,transparent_15%,#000_70%)]">
      <FlickeringGrid
        color="rgb(16, 185, 129)"
        maxOpacity={0.15}
        flickerChance={0.08}
        squareSize={3}
        gridGap={8}
        className="size-full"
      />
      {/* Floating security badges */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4">
        <div className="flex items-center gap-2">
          {["Encrypted", "Isolated", "Zero-trust"].map((label) => (
            <span
              key={label}
              className="flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50/80 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 backdrop-blur-sm"
            >
              <Shield className="size-2.5" />
              {label}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {["TLS 1.3", "SSH-only", "DDoS Shield"].map((label) => (
            <span
              key={label}
              className="flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50/80 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 backdrop-blur-sm"
            >
              <Shield className="size-2.5" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Background: Terminal control ── */
function ServerTerminal() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden p-6 mask-[linear-gradient(to_top,transparent_10%,#000_60%)]">
      <div className="w-full max-w-120 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-950 shadow-lg">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-neutral-800 px-3 py-2">
          <div className="flex gap-1.5">
            <div className="size-2 rounded-full bg-red-500/80" />
            <div className="size-2 rounded-full bg-yellow-500/80" />
            <div className="size-2 rounded-full bg-green-500/80" />
          </div>
          <span className="ml-2 text-[10px] font-medium text-neutral-500">root@fireclaw-vps</span>
        </div>
        {/* Terminal content */}
        <div className="space-y-1.5 p-3 font-mono text-[11px] leading-relaxed">
          <div className="text-green-400">$ ssh root@agent.fireclaw.ai</div>
          <div className="text-neutral-500">Welcome to Ubuntu 24.04 LTS</div>
          <div className="text-neutral-600">Last login: 2 min ago from 192.168.1.1</div>
          <div className="mt-2 text-green-400">$ docker ps</div>
          <div className="text-neutral-400">
            <span className="text-cyan-400">openclaw </span>
            <span className="text-emerald-400"> Up 14d </span>
            <span className="text-neutral-500"> 0.0.0.0:18789→18789</span>
          </div>
          <div className="text-neutral-400">
            <span className="text-cyan-400">caddy   </span>
            <span className="text-emerald-400"> Up 14d </span>
            <span className="text-neutral-500"> 0.0.0.0:443→443</span>
          </div>
          <div className="mt-2 text-green-400">
            $ fireclaw status
            <span className="ml-1 inline-block h-3.5 w-1 animate-pulse bg-green-400/70" />
          </div>
        </div>
      </div>
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
    background: <SecurityGrid />,
  },
  {
    Icon: Server,
    name: "Full Server Control",
    description:
      "Root SSH access, custom configs, your own domain. It's your server — we just make it effortless.",
    href: "#",
    cta: "Explore plans",
    className: "col-span-3",
    background: <ServerTerminal />,
  },
]

/* ── Main Section ── */
export function Features() {
  return (
    <section id="features" className="relative bg-neutral-50/60 py-24 sm:py-32">
      {/* Subtle dot pattern background */}
      <DotPattern
        width={20}
        height={20}
        cr={1}
        className="absolute inset-0 text-neutral-300/40 mask-[radial-gradient(ellipse_80%_60%_at_50%_50%,black_40%,transparent)]"
      />

      <div className="relative mx-auto max-w-6xl px-6">
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
