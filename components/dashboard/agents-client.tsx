"use client"

import Link from "next/link"
import { useState } from "react"
import {
  Server,
  Search,
  Rocket,
  ExternalLink,
  LayoutGrid,
  List,
} from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"
import { BorderBeam } from "@/components/ui/border-beam"
import { cn } from "@/lib/utils"

interface AgentRow {
  id: string
  name: string
  status: "provisioning" | "running" | "stopped" | "error"
  region: string
  serverIp: string | null
  template: string
  messageCount: number
  createdAt: string
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

export function AgentsClient({ agents }: { agents: AgentRow[] }) {
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"grid" | "list">("grid")

  const filtered = agents.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <BlurFade inView delay={0}>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[28px] font-black tracking-[-0.03em] text-neutral-900">
              Agents
            </h1>
            <p className="mt-1 text-[14px] text-neutral-500">
              {agents.length} agent{agents.length !== 1 ? "s" : ""} deployed
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

      {/* Search + view toggle */}
      <BlurFade inView delay={0.05}>
        <div className="mb-6 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-4 text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
            />
          </div>
          <div className="flex rounded-lg border border-neutral-200 bg-white">
            <button
              onClick={() => setView("grid")}
              className={cn(
                "rounded-l-lg p-2 transition-colors",
                view === "grid" ? "bg-neutral-100 text-neutral-900" : "text-neutral-400 hover:text-neutral-600"
              )}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "rounded-r-lg p-2 transition-colors",
                view === "list" ? "bg-neutral-100 text-neutral-900" : "text-neutral-400 hover:text-neutral-600"
              )}
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </BlurFade>

      {/* Content */}
      <BlurFade inView delay={0.1}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-200 bg-white py-20 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-neutral-100">
              <Server className="size-5 text-neutral-400" />
            </div>
            <p className="text-[14px] font-medium text-neutral-500">
              {search ? "No agents match your search" : "No agents yet"}
            </p>
            {!search && (
              <Link
                href="/dashboard/deploy"
                className="rounded-full bg-neutral-900 px-4 py-2 text-[12px] font-semibold text-white hover:bg-neutral-700"
              >
                Deploy your first agent
              </Link>
            )}
          </div>
        ) : view === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((agent) => (
              <Link
                key={agent.id}
                href={`/dashboard/agents/${agent.id}`}
                className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 transition-all hover:border-neutral-300 hover:shadow-md"
              >
                {agent.status === "running" && (
                  <BorderBeam size={100} borderWidth={1.5} colorFrom="#10b981" colorTo="#34d399" duration={8} />
                )}
                {agent.status === "error" && (
                  <BorderBeam size={100} borderWidth={1.5} colorFrom="#ef4444" colorTo="#f87171" duration={4} />
                )}

                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("size-2.5 rounded-full", statusColor[agent.status])} />
                    <h3 className="text-[15px] font-bold text-neutral-900">{agent.name}</h3>
                  </div>
                  <span className={cn(
                    "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                    agent.status === "running" && "bg-emerald-50 text-emerald-700",
                    agent.status === "provisioning" && "bg-amber-50 text-amber-700",
                    agent.status === "stopped" && "bg-neutral-100 text-neutral-500",
                    agent.status === "error" && "bg-red-50 text-red-600",
                  )}>
                    {statusLabel[agent.status]}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-md bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
                    {regionLabel[agent.region] ?? agent.region}
                  </span>
                  <span className="rounded-md bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
                    {agent.template}
                  </span>
                  <span className="rounded-md bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
                    {agent.messageCount.toLocaleString()} msgs
                  </span>
                </div>

                {agent.status === "running" && agent.serverIp && (
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-orange-600">
                    <ExternalLink className="size-3" />
                    Open Dashboard
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100 text-left">
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400">Name</th>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400">Status</th>
                  <th className="hidden px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400 md:table-cell">Region</th>
                  <th className="hidden px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400 md:table-cell">Messages</th>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((agent) => (
                  <tr key={agent.id} className="transition-colors hover:bg-neutral-50">
                    <td className="px-5 py-3.5">
                      <Link href={`/dashboard/agents/${agent.id}`} className="text-[13px] font-semibold text-neutral-900 hover:underline">
                        {agent.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1.5">
                        <span className={cn("size-1.5 rounded-full", statusColor[agent.status])} />
                        <span className="text-[12px] font-medium text-neutral-600">{statusLabel[agent.status]}</span>
                      </span>
                    </td>
                    <td className="hidden px-5 py-3.5 text-[12px] text-neutral-500 md:table-cell">
                      {regionLabel[agent.region] ?? agent.region}
                    </td>
                    <td className="hidden px-5 py-3.5 text-[12px] text-neutral-500 md:table-cell">
                      {agent.messageCount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-neutral-400">
                      {new Date(agent.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </BlurFade>
    </div>
  )
}
