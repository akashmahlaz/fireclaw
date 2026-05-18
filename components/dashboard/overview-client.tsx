"use client"

import Link from "next/link"
import { Activity, AlertTriangle, Bot, Rocket, TrendingUp, CheckCircle2, Clock } from "lucide-react"
import { NumberTicker } from "@/components/ui/number-ticker"
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar"
import { BlurFade } from "@/components/ui/blur-fade"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
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

const statusBadge = {
  running: "bg-emerald-50 text-emerald-700 border-emerald-200",
  provisioning: "bg-amber-50 text-amber-700 border-amber-200",
  stopped: "bg-neutral-100 text-neutral-500 border-neutral-200",
  error: "bg-red-50 text-red-600 border-red-200",
}

const statusLabel = {
  running: "Running",
  provisioning: "Provisioning",
  stopped: "Stopped",
  error: "Error",
}

const regionLabel: Record<string, string> = {
  "eu-central": "Frankfurt",
  "us-east": "Virginia",
  "ap-south": "Mumbai",
}

export function OverviewClient({
  agentCount,
  runningCount,
  errorCount,
  agents,
}: OverviewClientProps) {
  const stoppedCount = agentCount - runningCount - errorCount
  const uptimePercent = agentCount > 0 ? Math.round((runningCount / agentCount) * 100) : 0

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <BlurFade inView delay={0}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
            <p className="text-sm text-muted-foreground">Your infrastructure at a glance.</p>
          </div>
          <Button asChild size="sm">
            <Link href="/dashboard/deploy">
              <Rocket className="mr-1.5 size-3.5" />
              Deploy Agent
            </Link>
          </Button>
        </div>
      </BlurFade>

      {/* Stat cards — dashboard-01 layout */}
      <BlurFade inView delay={0.05}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
              <Bot className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {agentCount > 0 ? <NumberTicker value={agentCount} /> : "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                {agentCount === 0 ? "No agents deployed yet" : `${runningCount} currently active`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Running</CardTitle>
              <Activity className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {runningCount > 0 ? <NumberTicker value={runningCount} /> : "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                {runningCount > 0 ? "Serving requests" : "No agents running"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Errors</CardTitle>
              <AlertTriangle className="size-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold", errorCount > 0 ? "text-red-500" : "text-foreground")}>
                {errorCount > 0 ? <NumberTicker value={errorCount} /> : "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                {errorCount === 0 ? "All clear" : "Need attention"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fleet Health</CardTitle>
              <TrendingUp className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <AnimatedCircularProgressBar
                  max={100}
                  value={uptimePercent}
                  min={0}
                  gaugePrimaryColor={uptimePercent >= 90 ? "#10b981" : uptimePercent >= 60 ? "#f59e0b" : "#ef4444"}
                  gaugeSecondaryColor="#e5e7eb"
                  className="size-12"
                />
                <div>
                  <p className="text-2xl font-bold">{uptimePercent}%</p>
                  <p className="text-xs text-muted-foreground">uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </BlurFade>

      {/* Recent agents */}
      <BlurFade inView delay={0.1}>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Agents</CardTitle>
                  <CardDescription>Your last deployed agents and their status.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/agents">View all →</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {agents.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <div className="flex size-12 items-center justify-center rounded-xl border bg-muted">
                    <Bot className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">No agents yet</p>
                    <p className="text-xs text-muted-foreground">Deploy your first agent to get started.</p>
                  </div>
                  <Button asChild size="sm" className="mt-2">
                    <Link href="/dashboard/deploy">Deploy your first agent</Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y">
                  {agents.slice(0, 6).map((agent) => (
                    <Link
                      key={agent.id}
                      href={`/dashboard/agents/${agent.id}`}
                      className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-muted/50"
                    >
                      <div className={cn("size-2 shrink-0 rounded-full", statusColor[agent.status])} />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-medium">{agent.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {regionLabel[agent.region] ?? agent.region}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("text-[11px] font-medium", statusBadge[agent.status])}
                      >
                        {statusLabel[agent.status]}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
            {agents.length > 0 && (
              <CardFooter className="border-t pt-4">
                <p className="text-xs text-muted-foreground">
                  Showing {Math.min(agents.length, 6)} of {agents.length} agents
                </p>
              </CardFooter>
            )}
          </Card>

          {/* Quick status panel */}
          <Card>
            <CardHeader>
              <CardTitle>Status Breakdown</CardTitle>
              <CardDescription>All agents by current state.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <StatusRow
                icon={<CheckCircle2 className="size-4 text-emerald-500" />}
                label="Running"
                value={runningCount}
                total={agentCount}
                color="bg-emerald-500"
              />
              <StatusRow
                icon={<Clock className="size-4 text-amber-500" />}
                label="Provisioning"
                value={agents.filter((a) => a.status === "provisioning").length}
                total={agentCount}
                color="bg-amber-500"
              />
              <StatusRow
                icon={<AlertTriangle className="size-4 text-red-500" />}
                label="Error"
                value={errorCount}
                total={agentCount}
                color="bg-red-500"
              />
              <StatusRow
                icon={<Bot className="size-4 text-muted-foreground" />}
                label="Stopped"
                value={stoppedCount > 0 ? stoppedCount : 0}
                total={agentCount}
                color="bg-neutral-400"
              />
            </CardContent>
            {agentCount === 0 && (
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/dashboard/deploy">
                    <Rocket className="mr-1.5 size-3.5" />
                    Deploy your first agent
                  </Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </BlurFade>
    </div>
  )
}

function StatusRow({
  icon,
  label,
  value,
  total,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  total: number
  color: string
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium">{label}</span>
        </div>
        <span className="text-muted-foreground">{value}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted">
        <div
          className={cn("h-1.5 rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
