"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Search,
  Server,
  Rocket,
  ExternalLink,
  LayoutGrid,
  List,
  Bot,
} from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

interface AgentRow {
  id: string;
  name: string;
  status: "provisioning" | "running" | "stopped" | "error";
  region: string;
  serverIp: string | null;
  template: string;
  messageCount: number;
  createdAt: string;
}

const statusDot: Record<AgentRow["status"], string> = {
  running: "bg-emerald-500",
  provisioning: "bg-amber-500",
  stopped: "bg-neutral-400",
  error: "bg-red-500",
};

const statusBadgeBg: Record<AgentRow["status"], string> = {
  running: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  provisioning: "bg-amber-50 text-amber-700 border-amber-200/60",
  stopped: "bg-neutral-100 text-neutral-500 border-neutral-200/60",
  error: "bg-red-50 text-red-600 border-red-200/60",
};

const statusLabel: Record<AgentRow["status"], string> = {
  running: "Running",
  provisioning: "Provisioning",
  stopped: "Stopped",
  error: "Error",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AgentsClient({ agents }: { agents: AgentRow[] }) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = agents.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      {/* Header */}
      <BlurFade inView delay={0}>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-neutral-900">
              Your Agents
            </h1>
            <p className="mt-1.5 text-sm text-neutral-500">
              {agents.length} agent{agents.length !== 1 ? "s" : ""} deployed
            </p>
          </div>
          <Button asChild className="gap-2 rounded-full px-5">
            <Link href="/dashboard/deploy">
              <Rocket className="size-4" />
              Deploy Agent
            </Link>
          </Button>
        </div>
      </BlurFade>

      {/* Search + View Toggle */}
      <BlurFade inView delay={0.05}>
        <div className="mb-8 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search agents…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900/5"
            />
          </div>

          {/* View toggle pill */}
          <div className="flex items-center rounded-xl border border-neutral-200 bg-neutral-50 p-1">
            <button
              onClick={() => setView("grid")}
              className={cn(
                "flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                view === "grid"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-400 hover:text-neutral-600",
              )}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                view === "list"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-400 hover:text-neutral-600",
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
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white px-6 py-24 text-center">
            <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-neutral-100">
              <Bot className="size-7 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900">
              {search ? "No agents found" : "No agents yet"}
            </h3>
            <p className="mt-1.5 max-w-sm text-sm text-neutral-500">
              {search
                ? "Try a different search term or clear your filter."
                : "Deploy your first AI agent to get started. It only takes a minute."}
            </p>
            {!search && (
              <Button asChild className="mt-6 gap-2 rounded-full px-6">
                <Link href="/dashboard/deploy">
                  <Rocket className="size-4" />
                  Deploy your first agent
                </Link>
              </Button>
            )}
          </div>
        ) : view === "grid" ? (
          /* Grid View */
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((agent) => (
              <Link
                key={agent.id}
                href={`/dashboard/agents/${agent.id}`}
                className="group rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-neutral-900/5"
              >
                {/* Card top: name + status */}
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 transition-colors group-hover:bg-neutral-200/70">
                      <Server className="size-4 text-neutral-500" />
                    </div>
                    <h3 className="truncate text-[15px] font-semibold text-neutral-900">
                      {agent.name}
                    </h3>
                  </div>
                  {/* Status badge */}
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
                      statusBadgeBg[agent.status],
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        statusDot[agent.status],
                      )}
                    />
                    {statusLabel[agent.status]}
                  </span>
                </div>

                {/* Card meta */}
                <div className="space-y-2.5 text-sm text-neutral-500">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Template</span>
                    <span className="font-medium text-neutral-700">
                      {agent.template}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Messages</span>
                    <span className="font-medium text-neutral-700">
                      {agent.messageCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Created</span>
                    <span className="font-medium text-neutral-700">
                      {formatDate(agent.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Footer link hint */}
                <div className="mt-4 flex items-center gap-1.5 border-t border-neutral-100 pt-4 text-xs font-medium text-neutral-400 transition-colors group-hover:text-neutral-600">
                  <ExternalLink className="size-3" />
                  View details
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Name
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Status
                  </th>
                  <th className="hidden px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-neutral-400 md:table-cell">
                    Template
                  </th>
                  <th className="hidden px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-neutral-400 lg:table-cell">
                    Messages
                  </th>
                  <th className="hidden px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-neutral-400 sm:table-cell">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((agent) => (
                  <tr
                    key={agent.id}
                    className="group transition-colors hover:bg-neutral-50/80"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/agents/${agent.id}`}
                        className="flex items-center gap-3 text-sm font-semibold text-neutral-900 group-hover:text-neutral-700"
                      >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                          <Server className="size-3.5 text-neutral-500" />
                        </div>
                        <span className="truncate">{agent.name}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
                          statusBadgeBg[agent.status],
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            statusDot[agent.status],
                          )}
                        />
                        {statusLabel[agent.status]}
                      </span>
                    </td>
                    <td className="hidden px-6 py-4 text-sm text-neutral-600 md:table-cell">
                      {agent.template}
                    </td>
                    <td className="hidden px-6 py-4 text-sm tabular-nums text-neutral-600 lg:table-cell">
                      {agent.messageCount.toLocaleString()}
                    </td>
                    <td className="hidden px-6 py-4 text-sm text-neutral-500 sm:table-cell">
                      {formatDate(agent.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </BlurFade>
    </div>
  );
}
