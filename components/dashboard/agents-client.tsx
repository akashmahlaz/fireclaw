"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Rocket, ExternalLink, Bot, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

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
  stopped: "bg-stone-300",
  error: "bg-red-500",
};

const statusText: Record<AgentRow["status"], string> = {
  running: "Live",
  provisioning: "Starting",
  stopped: "Stopped",
  error: "Error",
};

export function AgentsClient({ agents }: { agents: AgentRow[] }) {
  const [search, setSearch] = useState("");

  const filtered = agents.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="px-6 py-10 lg:px-12 lg:py-14 max-w-5xl">
      {/* Header */}
      <section className="mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400 mb-3">
          Fleet
        </p>
        <div className="flex items-end justify-between gap-4">
          <h1 className="font-display text-[clamp(2rem,4vw,3rem)] leading-[1.1] text-stone-900">
            {agents.length} agent{agents.length !== 1 ? "s" : ""}
          </h1>
          <Link
            href="/dashboard/marketplace"
            className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-5 py-2 text-[12px] font-semibold text-white transition-all hover:bg-stone-700 active:scale-[0.97]"
          >
            <Rocket className="size-3" />
            Deploy
          </Link>
        </div>
      </section>

      {/* Search */}
      <section className="mb-6">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search agents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-stone-200 bg-white pl-9 pr-4 text-[13px] text-stone-900 placeholder:text-stone-400 transition-colors focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/5"
          />
        </div>
      </section>

      {/* Agent list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-stone-100">
            <Bot className="size-5 text-stone-400" />
          </div>
          <p className="text-[14px] font-medium text-stone-600 mb-1">
            {search ? "No agents match your search" : "No agents yet"}
          </p>
          <p className="text-[12px] text-stone-400">
            {search
              ? "Try a different term."
              : "Deploy your first agent from the marketplace."}
          </p>
          {!search && (
            <Link
              href="/dashboard/marketplace"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-4 py-2 text-[12px] font-semibold text-white hover:bg-stone-700"
            >
              <Rocket className="size-3" />
              Browse Marketplace
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden border border-stone-200 bg-white">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[1fr_100px_100px_80px_80px] gap-4 px-5 py-3 border-b border-stone-100 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400">
            <span>Agent</span>
            <span>Template</span>
            <span>Region</span>
            <span className="text-right">Messages</span>
            <span className="text-right">Status</span>
          </div>

          {/* Rows */}
          {filtered.map((agent) => (
            <Link
              key={agent.id}
              href={`/dashboard/agents/${agent.id}`}
              className="group flex sm:grid sm:grid-cols-[1fr_100px_100px_80px_80px] gap-4 items-center px-5 py-3.5 border-b border-stone-100 last:border-b-0 transition-colors hover:bg-stone-50"
            >
              {/* Name + status dot */}
              <span className="flex items-center gap-3 min-w-0">
                <span className="relative flex size-2">
                  {agent.status === "running" && (
                    <span
                      className={cn(
                        "absolute inline-flex size-full rounded-full opacity-40 animate-ping",
                        statusDot[agent.status],
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "relative inline-flex size-2 rounded-full",
                      statusDot[agent.status],
                    )}
                  />
                </span>
                <span className="truncate text-[13px] font-medium text-stone-900">
                  {agent.name}
                </span>
              </span>

              {/* Template */}
              <span className="hidden sm:block text-[12px] text-stone-500 truncate">
                {agent.template}
              </span>

              {/* Region */}
              <span className="hidden sm:flex items-center gap-1 text-[11px] text-stone-400 font-mono">
                <Globe className="size-3" />
                {agent.region}
              </span>

              {/* Messages */}
              <span className="hidden sm:block text-[12px] text-stone-500 text-right font-mono tabular-nums">
                {agent.messageCount.toLocaleString()}
              </span>

              {/* Status */}
              <span
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-wider text-right",
                  agent.status === "running" && "text-emerald-600",
                  agent.status === "provisioning" && "text-amber-600",
                  agent.status === "stopped" && "text-stone-400",
                  agent.status === "error" && "text-red-500",
                )}
              >
                {statusText[agent.status]}
              </span>

              {/* Mobile: show open icon on hover */}
              <ExternalLink className="size-3.5 text-stone-300 opacity-0 transition-opacity group-hover:opacity-100 sm:hidden" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
