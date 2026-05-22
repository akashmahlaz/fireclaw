"use client";

import Link from "next/link";
import {
  Bot,
  Rocket,
  Activity,
  AlertCircle,
  ArrowUpRight,
  Globe,
  Calendar,
} from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  stopped: "bg-neutral-400",
  error: "bg-red-500",
};

const statusLabel: Record<AgentSummary["status"], string> = {
  running: "Running",
  provisioning: "Provisioning",
  stopped: "Stopped",
  error: "Error",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function OverviewClient({
  agentCount,
  runningCount,
  errorCount,
  agents,
}: OverviewClientProps) {
  const uptimePercent =
    agentCount > 0 ? Math.round((runningCount / agentCount) * 100) : 100;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 p-6 md:p-10">
      {/* Header */}
      <BlurFade inView delay={0}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Here&apos;s how your agents are performing today.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/deploy">
              <Rocket className="mr-2 size-4" />
              Choose Agent
            </Link>
          </Button>
        </div>
      </BlurFade>

      {/* Stat Cards */}
      <BlurFade inView delay={0.05}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Agents"
            value={agentCount}
            icon={<Bot className="size-4" />}
            subtitle={
              agentCount === 1
                ? "1 agent deployed"
                : `${agentCount} agents deployed`
            }
          />
          <StatCard
            label="Running"
            value={runningCount}
            icon={<Activity className="size-4" />}
            valueClassName="text-emerald-600 dark:text-emerald-400"
            subtitle="Currently active"
          />
          <StatCard
            label="Errors"
            value={errorCount}
            icon={<AlertCircle className="size-4" />}
            valueClassName={
              errorCount > 0 ? "text-red-600 dark:text-red-400" : undefined
            }
            subtitle={
              errorCount === 0 ? "All systems healthy" : "Needs attention"
            }
          />
          <StatCard
            label="Uptime"
            value={`${uptimePercent}%`}
            icon={<ArrowUpRight className="size-4" />}
            valueClassName={
              uptimePercent >= 90
                ? "text-emerald-600 dark:text-emerald-400"
                : uptimePercent >= 60
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-red-600 dark:text-red-400"
            }
            subtitle="Fleet health"
          />
        </div>
      </BlurFade>

      {/* Recent Agents */}
      <BlurFade inView delay={0.1}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold tracking-tight">
              Recent Agents
            </h2>
            {agents.length > 0 && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/agents">View all</Link>
              </Button>
            )}
          </div>

          {agents.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-3">
              {agents.slice(0, 6).map((agent, i) => (
                <BlurFade key={agent.id} inView delay={0.12 + i * 0.03}>
                  <AgentRow agent={agent} />
                </BlurFade>
              ))}
            </div>
          )}
        </div>
      </BlurFade>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  subtitle,
  valueClassName,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  subtitle: string;
  valueClassName?: string;
}) {
  return (
    <Card className="rounded-xl border-0 bg-muted/40 shadow-none transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <div className="text-muted-foreground/60">{icon}</div>
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            "text-3xl font-semibold tracking-tight",
            valueClassName,
          )}
        >
          {value}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function AgentRow({ agent }: { agent: AgentSummary }) {
  return (
    <Link
      href={`/dashboard/agents/${agent.id}`}
      className="group flex items-center gap-4 rounded-xl bg-muted/30 px-5 py-4 transition-all hover:bg-muted/60 hover:shadow-sm"
    >
      {/* Status dot */}
      <span className="relative flex size-3">
        <span
          className={cn(
            "absolute inline-flex size-full rounded-full opacity-30",
            agent.status === "running" && "animate-ping",
            statusDot[agent.status],
          )}
        />
        <span
          className={cn(
            "relative inline-flex size-3 rounded-full",
            statusDot[agent.status],
          )}
        />
      </span>

      {/* Agent info */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium">{agent.name}</span>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Globe className="size-3" />
            {agent.region}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3" />
            {formatDate(agent.createdAt)}
          </span>
        </div>
      </div>

      {/* Status badge */}
      <Badge variant="outline" className="text-xs capitalize">
        {statusLabel[agent.status]}
      </Badge>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-muted/30 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <Bot className="size-6 text-muted-foreground" />
      </div>
      <h3 className="font-heading mt-5 text-base font-semibold">
        No agents deployed yet
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Deploy your first AI agent in minutes. Choose from OpenClaw, Ad-Chain
        Verify, SEO Agent, and more.
      </p>
      <Button asChild className="mt-6">
        <Link href="/dashboard/deploy">
          <Rocket className="mr-2 size-4" />
          Deploy Your First Agent
        </Link>
      </Button>
    </div>
  );
}
