"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  ExternalLink,
  RotateCcw,
  Square,
  Trash2,
  Server,
  Globe,
  Clock,
  Cpu,
  MessageSquare,
  Copy,
  Check,
  Wrench,
} from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"
import { BorderBeam } from "@/components/ui/border-beam"
import { cn } from "@/lib/utils"

interface AgentDetail {
  id: string
  name: string
  status: "provisioning" | "running" | "stopped" | "error"
  region: string
  serverIp: string | null
  serverId: string | null
  domain: string | null
  gatewayToken: string | null
  template: string
  messageCount: number
  createdAt: string
  updatedAt: string
}

const statusColor = {
  running: "bg-emerald-500",
  provisioning: "bg-amber-500",
  stopped: "bg-neutral-400",
  error: "bg-red-500",
}

const statusLabel = {
  running: "Running",
  provisioning: "Provisioning…",
  stopped: "Stopped",
  error: "Error",
}

const regionLabel: Record<string, string> = {
  "eu-central": "🇩🇪 Frankfurt",
  "us-east": "🇺🇸 Virginia",
  "ap-south": "🇮🇳 Mumbai",
}

export function AgentDetailClient({ agent }: { agent: AgentDetail }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [configFixed, setConfigFixed] = useState(false)

  const domain = agent.domain ?? null

  // Build the dashboard URL with token in fragment (not query) for security
  // Fragment (#) is never sent to the server, avoiding log/Referer leakage
  const dashboardUrl = domain
    ? agent.gatewayToken
      ? `https://${domain}/#token=${agent.gatewayToken}`
      : `https://${domain}/`
    : null

  const handleAction = async (action: string) => {
    setLoading(action)
    try {
      if (action === "delete") {
        if (!confirm("Are you sure? This will permanently destroy the server and all data.")) {
          setLoading(null)
          return
        }
        const res = await fetch(`/api/agents/${agent.id}`, { method: "DELETE" })
        if (res.ok) {
          router.push("/dashboard/agents")
          return
        }
      } else {
        await fetch(`/api/agents/${agent.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        })
      }
      router.refresh()
    } catch {
      alert(`Failed to ${action} agent.`)
    } finally {
      setLoading(null)
    }
  }

  const copyDomain = () => {
    if (domain) {
      navigator.clipboard.writeText(`https://${domain}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleFixConfig = async () => {
    setLoading("fix-config")
    try {
      const res = await fetch(`/api/agents/${agent.id}/fix-config`, { method: "POST" })
      const data = await res.json()
      if (res.ok) {
        setConfigFixed(true)
        alert("Config fix applied! The dashboard should now work. Try opening it again.")
      } else {
        alert(`Fix failed: ${data.error ?? "Unknown error"}`)
      }
    } catch {
      alert("Failed to fix config. The server may be unreachable.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <BlurFade inView delay={0}>
        <div className="mx-auto max-w-4xl">
          {/* Back */}
          <Link
            href="/dashboard/agents"
            className="mb-6 inline-flex items-center gap-2 text-[13px] font-medium text-neutral-500 hover:text-neutral-700"
          >
            <ArrowLeft className="size-3.5" />
            All Agents
          </Link>

          {/* Header card */}
          <div className="relative mb-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6">
            {agent.status === "running" && (
              <BorderBeam size={150} borderWidth={2} colorFrom="#10b981" colorTo="#34d399" duration={10} />
            )}
            {agent.status === "error" && (
              <BorderBeam size={150} borderWidth={2} colorFrom="#ef4444" colorTo="#f87171" duration={5} />
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-neutral-100">
                  <Server className="size-5 text-neutral-600" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-[22px] font-black tracking-[-0.02em] text-neutral-900">
                      {agent.name}
                    </h1>
                    <span className={cn(
                      "flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                      agent.status === "running" && "bg-emerald-50 text-emerald-700",
                      agent.status === "provisioning" && "bg-amber-50 text-amber-700",
                      agent.status === "stopped" && "bg-neutral-100 text-neutral-500",
                      agent.status === "error" && "bg-red-50 text-red-600",
                    )}>
                      <span className={cn("size-1.5 rounded-full", statusColor[agent.status])} />
                      {statusLabel[agent.status]}
                    </span>
                  </div>
                  {domain && (
                    <button onClick={copyDomain} className="mt-1 flex items-center gap-1.5 text-[13px] font-mono text-orange-600 hover:text-orange-700">
                      {domain}
                      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Open OpenClaw Dashboard */}
              {agent.status === "running" && dashboardUrl && (
                <a
                  href={dashboardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-orange-600 active:scale-[0.97]"
                >
                  Open OpenClaw Dashboard
                  <ExternalLink className="size-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Info grid */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard icon={Globe} label="Region" value={regionLabel[agent.region] ?? agent.region} />
            <InfoCard icon={Cpu} label="Template" value={agent.template} />
            <InfoCard icon={MessageSquare} label="Messages" value={agent.messageCount.toLocaleString()} />
            <InfoCard
              icon={Clock}
              label="Created"
              value={new Date(agent.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            />
          </div>

          {/* Server details */}
          {agent.serverIp && (
            <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5">
              <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wider text-neutral-400">
                Server Details
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] text-neutral-400">IP Address</p>
                  <p className="font-mono text-[13px] text-neutral-900">{agent.serverIp}</p>
                </div>
                <div>
                  <p className="text-[11px] text-neutral-400">Server ID</p>
                  <p className="font-mono text-[13px] text-neutral-900">{agent.serverId}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h3 className="mb-4 text-[13px] font-bold uppercase tracking-wider text-neutral-400">
              Server Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <ActionButton
                icon={RotateCcw}
                label="Reboot"
                onClick={() => handleAction("reboot")}
                loading={loading === "reboot"}
                disabled={agent.status !== "running"}
              />
              <ActionButton
                icon={Wrench}
                label={configFixed ? "Config Fixed ✓" : "Fix Config"}
                onClick={handleFixConfig}
                loading={loading === "fix-config"}
                disabled={agent.status !== "running" || configFixed}
              />
              <ActionButton
                icon={Square}
                label="Stop"
                onClick={() => handleAction("stop")}
                loading={loading === "stop"}
                disabled={agent.status !== "running"}
                variant="secondary"
              />
              <ActionButton
                icon={Trash2}
                label="Terminate"
                onClick={() => handleAction("delete")}
                loading={loading === "delete"}
                variant="danger"
              />
            </div>
          </div>
        </div>
      </BlurFade>
    </div>
  )
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-neutral-50">
        <Icon className="size-3.5 text-neutral-400" />
      </div>
      <p className="text-[11px] text-neutral-400">{label}</p>
      <p className="text-[14px] font-bold text-neutral-900">{value}</p>
    </div>
  )
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  loading,
  disabled,
  variant = "primary",
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  loading?: boolean
  disabled?: boolean
  variant?: "primary" | "secondary" | "danger"
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed",
        variant === "primary" && "bg-neutral-900 text-white hover:bg-neutral-700",
        variant === "secondary" && "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
        variant === "danger" && "bg-red-50 text-red-600 hover:bg-red-100",
      )}
    >
      <Icon className={cn("size-3.5", loading && "animate-spin")} />
      {loading ? "Working..." : label}
    </button>
  )
}
