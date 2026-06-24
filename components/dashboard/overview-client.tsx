"use client";

import Link from "next/link";
import { Bot, Rocket, ArrowRight, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentSummary {
  id: string;
  name: string;
  status: "provisioning" | "running" | "stopped" | "error";
  region: string;
  createdAt: string;
}

interface OverviewClientProps {
  agentCount: number;
  runningCount: number;
  errorCount: number;
  agents: AgentSummary[];
}

const statusDot: Record<AgentSummary["status"], string> = {
  running: "bg-emerald-500",
  provisioning: "bg-amber-500",
  stopped: "bg-stone-300",
  error: "bg-red-500",
};

const statusText: Record<AgentSummary["status"], string> = {
  running: "Live",
  provisioning: "Starting",
  stopped: "Stopped",
  error: "Error",
};

const regionLabel: Record<string, string> = {
  "eu-central": "Frankfurt",
  "us-east": "Virginia",
  "ap-south": "Mumbai",
};

export function OverviewClient({
  agentCount,
  runningCount,
  errorCount,
  agents,
}: OverviewClientProps) {
  const uptimePercent =
    agentCount > 0 ? Math.round((runningCount / agentCount) * 100) : 100;

  return (
    <div className="px-6 py-10 lg:px-12 lg:py-14 max-w-5xl">
      {/* Hero section - editorial style */}
      <section className="mb-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400 mb-3">
          Dashboard
        </p>
        <h1 className="font-display text-[clamp(2.5rem,5vw,3.5rem)] leading-[1.05] text-stone-900 mb-2">
          {agentCount === 0 ? (
            "Deploy your first agent"
          ) : (
            <>
              <span className="text-orange-500">{runningCount}</span> agent
              {runningCount !== 1 ? "s" : ""} running
            </>
          )}
        </h1>
        <p className="text-[15px] text-stone-500 max-w-md leading-relaxed">
          {agentCount === 0
            ? "Choose from OpenClaw, Ad-Chain Verify, or SEO Agent. Your AI workforce deploys in under 5 minutes."
            : `${agentCount} total deployed · ${uptimePercent}% fleet uptime${errorCount > 0 ? ` · ${errorCount} need attention` : ""}`}
        </p>
      </section>

      {/* Metrics row - big serif numbers */}
      {agentCount > 0 && (
        <section className="mb-14 grid grid-cols-2 sm:grid-cols-4 gap-8">
          <Metric label="Total" value={agentCount} />
          <Metric
            label="Running"
            value={runningCount}
            accent="text-emerald-600"
          />
          <Metric
            label="Errors"
            value={errorCount}
            accent={errorCount > 0 ? "text-red-500" : undefined}
          />
          <Metric label="Uptime" value={`${uptimePercent}%`} />
        </section>
      )}

      {/* Agent list or empty state */}
      {agentCount === 0 ? (
        <EmptyState />
      ) : (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.15em] text-stone-400">
              Your agents
            </h2>
            <Link
              href="/dashboard/agents"
              className="inline-flex items-center gap-1 text-[12px] font-medium text-stone-500 hover:text-stone-900 transition-colors"
            >
              View all
              <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="space-y-px rounded-2xl overflow-hidden border border-stone-200 bg-white">
            {agents.slice(0, 5).map((agent) => (
              <Link
                key={agent.id}
                href={`/dashboard/agents/${agent.id}`}
                className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-stone-50 border-b border-stone-100 last:border-b-0"
              >
                {/* Status indicator */}
                <span className="relative flex size-2.5">
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
                      "relative inline-flex size-2.5 rounded-full",
                      statusDot[agent.status],
                    )}
                  />
                </span>

                {/* Name */}
                <span className="flex-1 truncate text-[14px] font-medium text-stone-900">
                  {agent.name}
                </span>

                {/* Region */}
                <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-stone-400 font-mono">
                  <Globe className="size-3" />
                  {regionLabel[agent.region] ?? agent.region}
                </span>

                {/* Status label */}
                <span
                  className={cn(
                    "text-[11px] font-semibold uppercase tracking-wider",
                    agent.status === "running" && "text-emerald-600",
                    agent.status === "provisioning" && "text-amber-600",
                    agent.status === "stopped" && "text-stone-400",
                    agent.status === "error" && "text-red-500",
                  )}
                >
                  {statusText[agent.status]}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ── Metric card ── */
function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-400 mb-1">
        {label}
      </p>
      <p
        className={cn(
          "font-display text-[2.5rem] leading-none tracking-tight",
          accent ?? "text-stone-900",
        )}
      >
        {value}
      </p>
    </div>
  );
}

/* ── Empty state ── */
function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
      <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-orange-50">
        <Bot className="size-7 text-orange-500" />
      </div>
      <h3 className="font-display text-[1.75rem] text-stone-900 mb-2">
        Ready when you are
      </h3>
      <p className="text-[14px] text-stone-500 max-w-sm mx-auto mb-6 leading-relaxed">
        Deploy OpenClaw, Ad-Chain Verify Agent, or SEO Agent. Each one runs on
        dedicated infrastructure with HTTPS and monitoring included.
      </p>
      <Link
        href="/dashboard/marketplace"
        className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-stone-700 active:scale-[0.97]"
      >
        <Rocket className="size-3.5" />
        Browse Marketplace
      </Link>
    </div>
  );
}
