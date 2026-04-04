"use client"

import { useState, useEffect, useCallback } from "react"
import { BlurFade } from "@/components/ui/blur-fade"
import { Globe } from "@/components/ui/globe"
import { AnimatePresence, motion } from "motion/react"
import type { COBEOptions } from "cobe"
import {
  Globe2,
  Zap,
  LayoutDashboard,
  Gauge,
  Lock,
  Terminal as TerminalIcon,
} from "lucide-react"

/* ── FireClaw data center locations ──────────────────────────────── */
const DC_LOCATIONS = [
  { name: "fsn1", city: "Falkenstein", flag: "🇩🇪", lat: 50.478, lng: 12.338 },
  { name: "nbg1", city: "Nuremberg", flag: "🇩🇪", lat: 49.4521, lng: 11.0767 },
  { name: "hel1", city: "Helsinki", flag: "🇫🇮", lat: 60.1699, lng: 24.9384 },
  { name: "ash", city: "Ashburn", flag: "🇺🇸", lat: 39.0438, lng: -77.4874 },
  { name: "hil", city: "Hillsboro", flag: "🇺🇸", lat: 45.523, lng: -122.989 },
  { name: "sin", city: "Singapore", flag: "🇸🇬", lat: 1.3521, lng: 103.8198 },
]

/* Light globe: white bg, light gray land, orange markers */
const globeConfig: COBEOptions = {
  width: 800,
  height: 800,
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.25,
  dark: 0,
  diffuse: 1.2,
  mapSamples: 20000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: [0.96, 0.4, 0.1],
  glowColor: [0.97, 0.97, 0.97],
  markers: DC_LOCATIONS.map((l) => ({
    location: [l.lat, l.lng] as [number, number],
    size: 0.08,
  })),
}

/* ── Slide visuals (all light themed) ───────────────────────────── */

function GlobalLocationsVisual() {
  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden">
      <div className="relative aspect-square w-full max-w-130">
        <Globe className="relative! inset-auto! max-w-none!" config={globeConfig} />
      </div>
      {/* Flag badges overlaid at bottom */}
      <div className="absolute bottom-4 left-0 right-0 flex flex-wrap items-center justify-center gap-2 px-4">
        {DC_LOCATIONS.map((l, i) => (
          <motion.span
            key={l.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.3 }}
            className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white/95 px-3 py-1.5 text-[12px] font-medium text-neutral-700 shadow-sm backdrop-blur-sm"
          >
            <span className="text-[14px] leading-none">{l.flag}</span>
            {l.city}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

function OneClickDeployVisual() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-neutral-200 bg-neutral-950 shadow-lg">
        <div className="flex items-center gap-1.5 border-b border-neutral-800 px-3 py-2">
          <div className="size-2 rounded-full bg-red-400" />
          <div className="size-2 rounded-full bg-yellow-400" />
          <div className="size-2 rounded-full bg-green-400" />
          <span className="ml-2 text-[10px] text-neutral-500">terminal</span>
        </div>
        <div className="space-y-1.5 p-4 font-mono text-[12px] leading-relaxed">
          <div className="text-green-400">$ fireclaw deploy --tier standard</div>
          <div className="text-neutral-500">→ Provisioning VPS in eu-central...</div>
          <div className="text-emerald-400">✓ VPS online (4 vCPU · 8 GB RAM)</div>
          <div className="text-emerald-400">✓ DNS propagated · SSL issued</div>
          <div className="text-emerald-400">✓ OpenClaw deployed · Health OK</div>
          <div className="mt-2 font-semibold text-white">🚀 Live in 47s → agent.fireclaw.ai</div>
        </div>
      </div>
    </div>
  )
}

function MultiAgentVisual() {
  const agents = [
    { name: "Sales Bot", status: "Healthy", region: "Ashburn", cpu: "12%" },
    { name: "Support Agent", status: "Healthy", region: "Helsinki", cpu: "8%" },
    { name: "Lead Qualifier", status: "Healthy", region: "Singapore", cpu: "23%" },
  ]
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
        <div className="border-b border-neutral-100 px-4 py-3">
          <span className="text-[13px] font-semibold text-neutral-900">Your Agents</span>
          <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
            3 running
          </span>
        </div>
        <div className="divide-y divide-neutral-100">
          {agents.map((a) => (
            <div key={a.name} className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-[13px] font-medium text-neutral-900">{a.name}</div>
                <div className="text-[11px] text-neutral-400">{a.region}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-neutral-400">CPU {a.cpu}</span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  {a.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PerformanceTiersVisual() {
  const tiers = [
    { name: "Starter", cpu: "2 vCPU", ram: "4 GB", price: "€4.49" },
    { name: "Standard", cpu: "4 vCPU", ram: "8 GB", price: "€6.99" },
    { name: "Pro", cpu: "8 vCPU", ram: "16 GB", price: "€12.49" },
    { name: "Enterprise", cpu: "16 vCPU", ram: "32 GB", price: "€22.99" },
  ]
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="grid w-full max-w-md grid-cols-2 gap-3">
        {tiers.map((t, i) => (
          <div
            key={t.name}
            className={`rounded-xl border p-4 shadow-sm ${
              i === 1
                ? "border-orange-200 bg-orange-50"
                : "border-neutral-200 bg-white"
            }`}
          >
            <div className="text-[13px] font-bold text-neutral-900">{t.name}</div>
            <div className="mt-1.5 text-[11px] text-neutral-500">
              {t.cpu} · {t.ram}
            </div>
            <div className="mt-2 text-[15px] font-bold text-neutral-900">
              {t.price}
              <span className="text-[11px] font-normal text-neutral-400">/mo</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SSLDomainsVisual() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-md space-y-2.5">
        {[
          { domain: "sales-bot.fireclaw.ai", auto: true },
          { domain: "support.myclient.com", auto: false },
          { domain: "leads-7x2f.fireclaw.ai", auto: true },
        ].map((d) => (
          <div
            key={d.domain}
            className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Lock className="size-3.5 text-emerald-500" />
              <span className="font-mono text-[13px] text-neutral-800">{d.domain}</span>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                d.auto
                  ? "bg-neutral-100 text-neutral-500"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              {d.auto ? "Auto" : "Custom"}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SSHAccessVisual() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-neutral-200 bg-neutral-950 shadow-lg">
        <div className="flex items-center gap-1.5 border-b border-neutral-800 px-3 py-2">
          <div className="size-2 rounded-full bg-red-400" />
          <div className="size-2 rounded-full bg-yellow-400" />
          <div className="size-2 rounded-full bg-green-400" />
          <span className="ml-2 text-[10px] text-neutral-500">ssh root@agent.fireclaw.ai</span>
        </div>
        <div className="space-y-1 p-4 font-mono text-[12px] leading-relaxed">
          <div className="text-neutral-500">Welcome to Ubuntu 24.04 LTS</div>
          <div className="text-green-400">root@fireclaw:~# docker ps</div>
          <div className="text-neutral-400">
            <span className="text-cyan-400">openclaw</span>{"  "}
            <span className="text-emerald-400">Up 14d</span>{"  "}
            <span className="text-neutral-600">:18789</span>
          </div>
          <div className="text-neutral-400">
            <span className="text-cyan-400">caddy</span>{"    "}
            <span className="text-emerald-400">Up 14d</span>{"  "}
            <span className="text-neutral-600">:443</span>
          </div>
          <div className="mt-1 text-green-400">
            root@fireclaw:~#
            <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-green-400/70" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Feature definitions ────────────────────────────────────────── */

const features = [
  {
    icon: Globe2,
    title: "6+ Global Locations",
    description:
      "Falkenstein, Nuremberg, Helsinki, Ashburn, Hillsboro, Singapore — with real-time availability. More regions coming soon.",
  },
  {
    icon: Zap,
    title: "One-Click Deploy",
    description:
      "Pick a tier and region — we provision a VPS, configure DNS, issue SSL, and run health checks. Live in under 60 seconds.",
  },
  {
    icon: LayoutDashboard,
    title: "Multi-Agent Dashboard",
    description:
      "Deploy and manage multiple AI agents from one place. Monitor status, restart containers — built for agencies.",
  },
  {
    icon: Gauge,
    title: "4 Performance Tiers",
    description:
      "Starter (2 vCPU) to Enterprise (16+ vCPU). Transparent pricing — you always see what you pay.",
  },
  {
    icon: Lock,
    title: "Auto SSL & Custom Domains",
    description:
      "Auto-provisioned TLS via Caddy on every fireclaw.ai subdomain. Bring your own domain — we handle DNS.",
  },
  {
    icon: TerminalIcon,
    title: "Full Root SSH Access",
    description:
      "Every agent runs on a dedicated VPS you fully control. SSH in, install packages, run scripts — it's your server.",
  },
]

const AUTO_ROTATE_MS = 5000

/* ── Visual Components (rendered once, toggled via opacity) ───── */

const VisualComponents = [
  GlobalLocationsVisual,
  OneClickDeployVisual,
  MultiAgentVisual,
  PerformanceTiersVisual,
  SSLDomainsVisual,
  SSHAccessVisual,
]

/* ── Main Section ───────────────────────────────────────────────── */

export function Features() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setActive((i) => (i + 1) % features.length)
  }, [])

  useEffect(() => {
    if (paused) return
    const id = setInterval(next, AUTO_ROTATE_MS)
    return () => clearInterval(id)
  }, [paused, next])

  return (
    <section id="features" className="relative bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <BlurFade inView delay={0}>
          <div className="mb-16 text-center">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[3px] text-neutral-400">
              Platform
            </p>
            <h2 className="text-[36px] font-black leading-[1.1] tracking-[-0.03em] text-neutral-900 sm:text-[44px] lg:text-[52px]">
              Infrastructure, handled.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-neutral-500">
              FireClaw provisions and manages the servers so you can focus on
              building your AI agent — not debugging cloud consoles.
            </p>
          </div>
        </BlurFade>

        {/* Slideshow */}
        <BlurFade inView delay={0.1}>
          <div
            className="flex flex-col gap-8 lg:flex-row lg:gap-0"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Left — tabs */}
            <div className="flex flex-col gap-1 lg:w-85 lg:shrink-0 lg:pr-8">
              {features.map((f, i) => {
                const isActive = i === active
                return (
                  <button
                    key={f.title}
                    type="button"
                    onClick={() => setActive(i)}
                    className={`group relative flex items-start gap-3 rounded-xl px-4 py-3.5 text-left transition-colors ${
                      isActive ? "bg-neutral-50" : "hover:bg-neutral-50/60"
                    }`}
                  >
                    {/* Active bar */}
                    <div
                      className={`absolute left-0 top-3 h-[calc(100%-24px)] w-0.75 rounded-full transition-colors ${
                        isActive
                          ? "bg-orange-500"
                          : "bg-transparent group-hover:bg-neutral-200"
                      }`}
                    />

                    <f.icon
                      className={`mt-0.5 size-4 shrink-0 transition-colors ${
                        isActive ? "text-orange-500" : "text-neutral-400"
                      }`}
                    />

                    <div className="min-w-0">
                      <div
                        className={`text-[14px] font-semibold transition-colors ${
                          isActive ? "text-neutral-900" : "text-neutral-500"
                        }`}
                      >
                        {f.title}
                      </div>
                      <AnimatePresence mode="wait">
                        {isActive && (
                          <motion.p
                            key={f.title}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-1 text-[13px] leading-relaxed text-neutral-500"
                          >
                            {f.description}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </button>
                )
              })}

              {/* Mobile dots */}
              <div className="mt-3 flex items-center justify-center gap-1.5 lg:hidden">
                {features.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActive(i)}
                    className={`size-1.5 rounded-full transition-colors ${
                      i === active ? "bg-orange-500" : "bg-neutral-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Right — visual panel (all visuals rendered, only active visible) */}
            <div className="relative min-h-100 flex-1 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 sm:min-h-120">
              {VisualComponents.map((Visual, i) => (
                <div
                  key={i}
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{
                    opacity: i === active ? 1 : 0,
                    pointerEvents: i === active ? "auto" : "none",
                  }}
                >
                  <Visual />
                </div>
              ))}
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
