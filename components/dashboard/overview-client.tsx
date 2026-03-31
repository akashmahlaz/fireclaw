"use client"

import Link from "next/link"
import { Server, AlertTriangle, Activity, Rocket } from "lucide-react"
import { NumberTicker } from "@/components/ui/number-ticker"
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar"
import { BlurFade } from "@/components/ui/blur-fade"
import { BorderBeam } from "@/components/ui/border-beam"
import { cn } from "@/lib/utils"

interface AgentSummary {
  id: string
  name: string
  status: "provisioning" | "running" | "stopped" | "error"
  region: string
  createdAt: string
}

interface OverviewClientProps {
  agentCount: number
  runningCount: number
  errorCount: number
  agents: AgentSummary[]
}

const statusColor = {
  running: "bg-emerald-500",
  provisioning: "bg-amber-500",
  stopped: "bg-neutral-400",
  error: "bg-red-500",
}

const statusLabel = {
  running: "Running",
  provisioning: "Provisioning",
  stopped: "Stopped",
  error: "Error",
}

const regionLabel: Record<string, string> = {
  "eu-central": "🇩🇪 Frankfurt",
  "us-east": "🇺🇸 Virginia",
  "ap-south": "🇮🇳 Mumbai",
}

export function OverviewClient({
  agentCount,
  runningCount,
  errorCount,
  agents,
}: OverviewClientProps) {
  const uptimePercent = agentCount > 0 ? Math.round((runningCount / agentCount) * 100) : 0

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <BlurFade inView delay={0}>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-black tracking-[-0.03em] text-neutral-900">
              Overview
            </h1>
            <p className="mt-1 text-[14px] text-neutral-500">
              Your infrastructure at a glance.
            </p>
          </div>
          <Link
            href="/dashboard/deploy"
            className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-neutral-700 active:scale-[0.97]"
          >
            <Rocket className="size-3.5" />
            Deploy Agent
          </Link>
        </div>
      </BlurFade>

      {/* Stat cards */}
      <BlurFade inView delay={0.05}>
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total agents */}
          <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-neutral-100">
                <Server className="size-4.5 text-neutral-600" />
              </div>
              <div>
                <p className="text-[12px] font-medium text-neutral-400">Total agents</p>
                <p className="text-[28px] font-black tracking-[-0.03em] text-neutral-900">
                  {agentCount > 0 ? <NumberTicker value={agentCount} /> : "0"}
                </p>
              </div>
            </div>
          </div>

          {/* Running */}
          <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50">
                <Activity className="size-4.5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[12px] font-medium text-neutral-400">Running</p>
                <p className="text-[28px] font-black tracking-[-0.03em] text-emerald-600">
                  {runningCount > 0 ? <NumberTicker value={runningCount} /> : "0"}
                </p>
              </div>
            </div>
            {runningCount > 0 && <BorderBeam size={80} borderWidth={1.5} colorFrom="#10b981" colorTo="#34d399" />}
          </div>

          {/* Errors */}
          <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-red-50">
                <AlertTriangle className="size-4.5 text-red-500" />
              </div>
              <div>
                <p className="text-[12px] font-medium text-neutral-400">Errors</p>
                <p className="text-[28px] font-black tracking-[-0.03em] text-red-500">
                  {errorCount > 0 ? <NumberTicker value={errorCount} /> : "0"}
                </p>
              </div>
            </div>
            {errorCount > 0 && <BorderBeam size={80} borderWidth={1.5} colorFrom="#ef4444" colorTo="#f87171" />}
          </div>

          {/* Uptime */}
          <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <AnimatedCircularProgressBar
                max={100}
                value={uptimePercent}
                min={0}
                gaugePrimaryColor="#f97316"
                gaugeSecondaryColor="#e5e5e5"
                className="size-12"
              />
              <div>
                <p className="text-[12px] font-medium text-neutral-400">Fleet health</p>
                <p className="text-[28px] font-black tracking-[-0.03em] text-neutral-900">
                  {uptimePercent}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </BlurFade>

      {/* Recent agents */}
      <BlurFade inView delay={0.1}>
        <div className="rounded-2xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
            <h2 className="text-[15px] font-bold text-neutral-900">Recent Agents</h2>
            <Link href="/dashboard/agents" className="text-[12px] font-medium text-neutral-400 hover:text-neutral-700">
              View all →
            </Link>
          </div>

          {agents.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex size-12 items-center justify-center rounded-xl bg-neutral-100">
                <Server className="size-5 text-neutral-400" />
              </div>
              <p className="text-[14px] font-medium text-neutral-500">No agents yet</p>
              <Link
                href="/dashboard/deploy"
                className="rounded-full bg-neutral-900 px-4 py-2 text-[12px] font-semibold text-white hover:bg-neutral-700"
              >
                Deploy your first agent
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {agents.slice(0, 5).map((agent) => (
                <Link
                  key={agent.id}
                  href={`/dashboard/agents/${agent.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-neutral-50"
                >
                  <div className={cn("size-2 rounded-full", statusColor[agent.status])} />
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-neutral-900">{agent.name}</p>
                    <p className="text-[11px] text-neutral-400">
                      {regionLabel[agent.region] ?? agent.region} · {statusLabel[agent.status]}
                    </p>
                  </div>
                  <span className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                    agent.status === "running" && "bg-emerald-50 text-emerald-700",
                    agent.status === "provisioning" && "bg-amber-50 text-amber-700",
                    agent.status === "stopped" && "bg-neutral-100 text-neutral-500",
                    agent.status === "error" && "bg-red-50 text-red-600",
                  )}>
                    {statusLabel[agent.status]}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </BlurFade>
    </div>
  )
}
