"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Rocket,
  Sparkles,
  XCircle,
  ExternalLink,
  Bot,
  Zap,
  Lock,
} from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import {
  AGENT_TEMPLATES,
  FIRECLAW_PLANS,
  getPlan,
  isTemplateAvailableOnPlan,
  type AgentTemplate,
} from "@/lib/agent-catalog"
import { BlurFade } from "@/components/ui/blur-fade"
import { BorderBeam } from "@/components/ui/border-beam"
import { MagicCard } from "@/components/ui/magic-card"
import { Confetti, type ConfettiRef } from "@/components/ui/confetti"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useAgent } from "@/hooks/use-queries"

interface ProvisionLogEntry {
  step: string
  status: "ok" | "pending" | "error"
  ts: number
}

function friendlyStep(raw: string): string {
  const msg = raw.toLowerCase()
  if (msg.includes("server") && msg.includes("creat")) return "Reserving a dedicated server for your agent"
  if (msg.includes("server") && msg.includes("start")) return "Server is starting up"
  if (msg.includes("dns")) return "Setting up your custom web address"
  if (msg.includes("ssl") || msg.includes("cert") || msg.includes("https") || msg.includes("caddy")) return "Securing your agent with HTTPS"
  if (msg.includes("docker") || msg.includes("pull") || msg.includes("image") || msg.includes("container")) return "Installing the agent software"
  if (msg.includes("health") || msg.includes("wait") || msg.includes("gateway")) return "Checking your agent is running correctly"
  if (msg.includes("live at") || msg.includes("running") || msg.includes("ready")) return "Your agent is live"
  if (msg.includes("cloud-init") || msg.includes("boot") || msg.includes("init")) return "Configuring the server environment"
  if (msg.includes("ip") || msg.includes("allocat")) return "Assigning a unique address to your agent"
  if (msg.includes("email")) return "Sending you a confirmation email"
  return raw
}

const deployableTemplates = AGENT_TEMPLATES.filter((t) => t.status !== "custom-setup")
const selectablePlans = FIRECLAW_PLANS.filter((plan) => plan.id !== "custom")
const ALL_CATEGORIES = "All"

const CATEGORY_ORDER = ["All", "Support", "Marketing", "Content", "Commerce", "Research", "Operations", "Analytics", "Sales", "Engineering"]

const PLAN_COLORS: Record<string, string> = {
  starter: "text-sky-600 bg-sky-50 border-sky-200",
  growth: "text-violet-600 bg-violet-50 border-violet-200",
  agency: "text-orange-600 bg-orange-50 border-orange-200",
  custom: "text-neutral-600 bg-neutral-50 border-neutral-200",
}

const WIZARD_STEPS = ["Agent", "Plan", "Name", "Deploy"]

export function DeployWizardClient() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const confettiRef = useRef<ConfettiRef>(null)

  const [step, setStep] = useState(0)
  const [templateId, setTemplateId] = useState(
    deployableTemplates.find((t) => t.status === "deployable")?.id ?? "customer-support",
  )
  const [planId, setPlanId] = useState("starter")
  const [name, setName] = useState("")
  const [deploying, setDeploying] = useState(false)
  const [deployed, setDeployed] = useState(false)
  const [deployError, setDeployError] = useState<string | null>(null)
  const [agentId, setAgentId] = useState<string | null>(null)
  const [category, setCategory] = useState(ALL_CATEGORIES)

  const selectedTemplate = deployableTemplates.find((t) => t.id === templateId)
  const selectedPlan = getPlan(planId)
  const templateAllowed = selectedTemplate ? isTemplateAvailableOnPlan(selectedTemplate.id, selectedPlan.id) : false

  const { data: polledAgent } = useAgent(agentId, {
    refetchInterval: deploying && !deployed && !deployError ? 3000 : false,
  })

  const provisionLog: ProvisionLogEntry[] = polledAgent?.provisionLog ?? []
  const agentDomain: string | null = polledAgent?.domain ?? null

  const categories = [
    ALL_CATEGORIES,
    ...CATEGORY_ORDER.filter(
      (c) => c !== ALL_CATEGORIES && deployableTemplates.some((t) => t.category === c),
    ),
  ]

  const filteredTemplates =
    category === ALL_CATEGORIES
      ? deployableTemplates
      : deployableTemplates.filter((t) => t.category === category)

  useEffect(() => {
    if (!selectedTemplate || isTemplateAvailableOnPlan(selectedTemplate.id, planId)) return
    setPlanId(selectedTemplate.minimumPlan)
  }, [planId, selectedTemplate])

  useEffect(() => {
    if (!polledAgent || deployed || deployError) return
    const logShowsLive = polledAgent.provisionLog?.some(
      (e: ProvisionLogEntry) => e.step.includes("Live at") && e.status === "ok",
    )
    if (polledAgent.status === "running" || logShowsLive) {
      setDeployed(true)
      setDeploying(false)
      queryClient.invalidateQueries({ queryKey: ["agents"] })
      setTimeout(() => confettiRef.current?.fire({}), 500)
    } else if (polledAgent.status === "error") {
      setDeployError("Something went wrong during setup. You can retry from your dashboard.")
      setDeploying(false)
    }
  }, [polledAgent, deployed, deployError, queryClient])

  const canNext = () => {
    if (step === 0) return !!selectedTemplate && selectedTemplate.status === "deployable"
    if (step === 1) return !!selectedPlan && templateAllowed
    if (step === 2) return name.trim().length >= 2
    return false
  }

  const handleDeploy = useCallback(async () => {
    setDeploying(true)
    setDeployError(null)
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), template: templateId, planId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Deploy failed")
      setAgentId(data._id)
    } catch (error) {
      setDeployError(error instanceof Error ? error.message : "Failed to start. Please try again.")
      setDeploying(false)
    }
  }, [name, planId, templateId])

  const goNext = () => {
    if (step === 2) {
      setStep(3)
      void handleDeploy()
    } else {
      setStep((s) => s + 1)
    }
  }

  const provisionProgress = (() => {
    if (!provisionLog.length) return 5
    const done = provisionLog.filter((e) => e.status === "ok").length
    return Math.min(95, Math.round((done / Math.max(provisionLog.length, 6)) * 100))
  })()

  return (
    <div className="min-h-full p-6 lg:p-8">
      <BlurFade inView delay={0}>
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-orange-100">
              <Rocket className="size-5 text-orange-600" />
            </div>
            <h1 className="text-[28px] font-black tracking-[-0.03em] text-neutral-900">
              Deploy a working agent
            </h1>
            <p className="mt-1 text-[14px] text-neutral-500">
              Pick the job, choose capacity, and FireClaw handles the rest.
            </p>
          </div>

          <div className="mb-10 flex items-center justify-center gap-2">
            {WIZARD_STEPS.map((label, index) => (
              <div key={label} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full text-[11px] font-bold transition-all",
                      index < step && "bg-emerald-500 text-white",
                      index === step && "bg-neutral-900 text-white",
                      index > step && "bg-neutral-100 text-neutral-400",
                    )}
                  >
                    {index < step ? <CheckCircle2 className="size-3.5" /> : index + 1}
                  </div>
                  <span
                    className={cn(
                      "hidden text-[12px] font-medium sm:block",
                      index === step ? "text-neutral-900" : "text-neutral-400",
                    )}
                  >
                    {label}
                  </span>
                </div>
                {index < WIZARD_STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-px w-8 transition-colors",
                      index < step ? "bg-emerald-400" : "bg-neutral-200",
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {step === 0 && (
            <BlurFade inView delay={0.05}>
              <Tabs value={category} onValueChange={setCategory} className="mb-6">
                <TabsList className="flex h-auto flex-wrap gap-1 bg-transparent p-0">
                  {categories.map((cat) => (
                    <TabsTrigger
                      key={cat}
                      value={cat}
                      className="rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-[12px] font-medium text-neutral-600 data-[state=active]:border-neutral-900 data-[state=active]:bg-neutral-900 data-[state=active]:text-white"
                    >
                      {cat}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTemplates.map((template) => (
                  <AgentCard
                    key={template.id}
                    template={template}
                    selected={templateId === template.id}
                    onSelect={() => {
                      if (template.status !== "deployable") return
                      setTemplateId(template.id)
                      setStep(1)
                    }}
                  />
                ))}
              </div>
            </BlurFade>
          )}

          {step === 1 && (
            <BlurFade inView delay={0.05}>
              <div className="mb-6">
                <h2 className="text-[20px] font-bold text-neutral-900">Choose your plan</h2>
                <p className="mt-1 text-[13px] text-neutral-500">
                  Plans control how many agents you can run simultaneously.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {selectablePlans.map((plan) => {
                  const allowed = selectedTemplate ? isTemplateAvailableOnPlan(selectedTemplate.id, plan.id) : false
                  const isSelected = planId === plan.id
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => {
                        if (!allowed) return
                        setPlanId(plan.id)
                        setStep(2)
                      }}
                      disabled={!allowed}
                      className={cn(
                        "relative flex flex-col overflow-hidden rounded-2xl border p-5 text-left transition-all disabled:cursor-not-allowed",
                        isSelected
                          ? "border-neutral-900 bg-white shadow-lg"
                          : allowed
                            ? "border-neutral-200 bg-white hover:border-neutral-400 hover:shadow-sm"
                            : "border-neutral-100 bg-neutral-50 opacity-50",
                      )}
                    >
                      {isSelected && (
                        <BorderBeam size={120} borderWidth={1.5} colorFrom="#f97316" colorTo="#fbbf24" />
                      )}
                      {plan.highlighted && (
                        <Badge className="mb-3 w-fit bg-orange-500 text-white hover:bg-orange-500">
                          <Zap className="mr-1 size-3" />
                          Most popular
                        </Badge>
                      )}
                      {!allowed && (
                        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-red-500">
                          <Lock className="size-3" />
                          Needs {getPlan(selectedTemplate?.minimumPlan).name}+
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-[17px] font-bold text-neutral-900">{plan.name}</h3>
                        {isSelected && <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />}
                      </div>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-[32px] font-black tracking-[-0.04em] text-neutral-900">
                          {plan.price}
                        </span>
                        <span className="text-[12px] font-medium text-neutral-400">{plan.period}</span>
                      </div>
                      <p className="mt-2 text-[12px] leading-relaxed text-neutral-500">{plan.description}</p>
                      <div className="mt-4 rounded-xl bg-neutral-50 px-3 py-2 text-[12px] font-semibold text-neutral-700">
                        {plan.agentLimit} deployed agent{plan.agentLimit > 1 ? "s" : ""}
                      </div>
                      <Separator className="my-4" />
                      <ul className="flex flex-1 flex-col gap-2">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-[12px] text-neutral-600">
                            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </button>
                  )
                })}
              </div>
            </BlurFade>
          )}

          {step === 2 && (
            <BlurFade inView delay={0.05}>
              <div className="mx-auto max-w-xl space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="agent-name" className="text-[13px] font-semibold text-neutral-700">
                    Agent name
                  </Label>
                  <Input
                    id="agent-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={`${selectedTemplate?.name ?? "Business"} Agent`}
                    autoFocus
                    className="h-11 rounded-xl border-neutral-200 text-[14px]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && canNext()) goNext()
                    }}
                  />
                  <p className="text-[11px] text-neutral-400">Only visible to you inside your dashboard.</p>
                </div>
                <Card className="overflow-hidden rounded-2xl border-orange-200">
                  <CardHeader className="bg-orange-50 px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 text-orange-600" />
                      <span className="text-[13px] font-bold text-orange-900">Deployment summary</span>
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 px-5 py-4 text-[13px]">
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">Agent</p>
                      <p className="font-semibold text-neutral-900">
                        {selectedTemplate?.icon} {selectedTemplate?.name}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">Plan</p>
                      <p className="font-semibold text-neutral-900">
                        {selectedPlan.name} — {selectedPlan.price}{selectedPlan.period}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">Region</p>
                      <p className="font-semibold text-neutral-900">Auto-selected (lowest latency)</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">Setup time</p>
                      <p className="font-semibold text-neutral-900">~3–5 minutes</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </BlurFade>
          )}

          {step === 3 && (
            <BlurFade inView delay={0.05}>
              <div className="mx-auto max-w-xl space-y-6">
                {!deployed && !deployError && (
                  <Card className="overflow-hidden rounded-2xl shadow-sm">
                    <CardHeader className="border-b border-neutral-100 bg-neutral-50 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-violet-100">
                          <Bot className="size-4 text-violet-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-neutral-900">{name}</p>
                          <p className="text-xs text-neutral-500">
                            {selectedTemplate?.name} · {selectedPlan.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                          <Loader2 className="size-3 animate-spin" />
                          Setting up
                        </div>
                      </div>
                      <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between text-[11px] text-neutral-500">
                          <span>Progress</span>
                          <span>{provisionProgress}%</span>
                        </div>
                        <Progress value={provisionProgress} className="h-1.5" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-neutral-100">
                        {provisionLog.length === 0 ? (
                          <div className="flex items-center gap-3 px-5 py-4">
                            <Loader2 className="size-4 shrink-0 animate-spin text-neutral-400" />
                            <span className="text-sm text-neutral-500">Getting things ready…</span>
                          </div>
                        ) : (
                          provisionLog.map((entry, index) => (
                            <div key={`${entry.ts}-${index}`} className="flex items-center gap-3 px-5 py-3.5">
                              {entry.status === "ok" && <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />}
                              {entry.status === "pending" && (
                                <Loader2 className="size-4 shrink-0 animate-spin text-amber-500" />
                              )}
                              {entry.status === "error" && <XCircle className="size-4 shrink-0 text-red-500" />}
                              <span
                                className={cn(
                                  "text-sm",
                                  entry.status === "ok" && "text-neutral-600",
                                  entry.status === "pending" && "font-medium text-neutral-900",
                                  entry.status === "error" && "text-red-700",
                                )}
                              >
                                {friendlyStep(entry.step)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                    <div className="border-t border-neutral-100 bg-neutral-50 px-5 py-3">
                      <p className="text-xs text-neutral-400">
                        Usually takes 3–5 minutes. Safe to close — we will email you when it is ready.
                      </p>
                    </div>
                  </Card>
                )}

                {deployError && (
                  <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
                    <XCircle className="mt-0.5 size-5 shrink-0 text-red-500" />
                    <div>
                      <p className="text-sm font-semibold text-red-900">Setup did not complete</p>
                      <p className="mt-1 text-sm text-red-700">{deployError}</p>
                      <button
                        onClick={() => agentId && router.push(`/dashboard/agents/${agentId}`)}
                        className="mt-3 text-sm font-medium text-red-700 underline underline-offset-2 hover:no-underline"
                      >
                        View details
                      </button>
                    </div>
                  </div>
                )}

                {deployed && (
                  <div className="flex flex-col items-center gap-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-4xl">
                      {selectedTemplate?.icon ?? "🤖"}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-neutral-900">{name} is live!</p>
                      <p className="mt-1 text-sm text-neutral-500">
                        Your {selectedTemplate?.name} is running and ready to work.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      {agentDomain && (
                        <a
                          href={`https://${agentDomain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm ring-1 ring-neutral-200 hover:bg-neutral-50"
                        >
                          Open agent
                          <ExternalLink className="size-3.5" />
                        </a>
                      )}
                      <Button onClick={() => agentId && router.push(`/dashboard/agents/${agentId}`)}>
                        Go to dashboard
                      </Button>
                    </div>
                  </div>
                )}

                <Confetti
                  ref={confettiRef}
                  className="pointer-events-none absolute left-0 top-0 z-50 size-full"
                />
              </div>
            </BlurFade>
          )}

          {step > 0 && step < 3 && (
            <div className="mt-10 flex items-center justify-between border-t border-neutral-100 pt-6">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="gap-2"
              >
                <ArrowLeft className="size-3.5" />
                Back
              </Button>
              {step === 2 && (
                <Button onClick={goNext} disabled={!canNext()} className="gap-2 rounded-full px-6">
                  Deploy Agent
                  <Rocket className="size-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </BlurFade>
    </div>
  )
}

function AgentCard({
  template,
  selected,
  onSelect,
}: {
  template: AgentTemplate
  selected: boolean
  onSelect: () => void
}) {
  const isDeployable = template.status === "deployable"
  const isComingSoon = template.status === "coming-soon"
  const minPlan = getPlan(template.minimumPlan)

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!isDeployable}
      className={cn(
        "group relative flex w-full flex-col overflow-hidden rounded-2xl border bg-white text-left transition-all",
        isDeployable && selected && "border-neutral-900 shadow-lg",
        isDeployable && !selected && "border-neutral-200 hover:border-neutral-400 hover:shadow-md",
        !isDeployable && "cursor-default border-neutral-100 opacity-60",
      )}
    >
      {selected && isDeployable && (
        <BorderBeam size={100} borderWidth={1.5} colorFrom="#f97316" colorTo="#fbbf24" />
      )}
      <MagicCard
        className="flex h-full flex-col p-5"
        gradientColor={selected ? "#fff7ed" : "#f9fafb"}
        gradientOpacity={0.6}
      >
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="flex size-11 items-center justify-center rounded-xl bg-neutral-100 text-2xl">
            {template.icon}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wider">
              {template.category}
            </Badge>
            {isComingSoon && (
              <Badge variant="outline" className="text-[10px] font-medium text-neutral-500">
                Coming soon
              </Badge>
            )}
            {isDeployable && (
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                  PLAN_COLORS[minPlan.id] ?? "text-neutral-600 bg-neutral-50 border-neutral-200",
                )}
              >
                {minPlan.name}+
              </span>
            )}
          </div>
        </div>
        <h3 className="text-[16px] font-bold text-neutral-900">{template.name}</h3>
        <p className="mt-1.5 text-[12px] leading-relaxed text-neutral-500">{template.description}</p>
        {template.capabilities.length > 0 && (
          <ul className="mt-4 flex flex-col gap-1.5">
            {template.capabilities.map((cap) => (
              <li key={cap} className="flex items-start gap-2 text-[11px] text-neutral-600">
                <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-emerald-500" />
                {cap}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
          {isDeployable ? (
            <>
              <span className="text-[11px] font-medium text-neutral-400">Managed AI included</span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
                  "bg-neutral-900 text-white opacity-0 group-hover:opacity-100",
                )}
              >
                Choose →
              </span>
            </>
          ) : (
            <span className="text-[11px] font-medium text-neutral-400">Notify me when ready</span>
          )}
        </div>
      </MagicCard>
    </button>
  )
}
