"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Rocket, Sparkles, XCircle, ExternalLink, Bot } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { AGENT_TEMPLATES, FIRECLAW_PLANS, getPlan, isTemplateAvailableOnPlan } from "@/lib/agent-catalog"
import { BlurFade } from "@/components/ui/blur-fade"
import { BorderBeam } from "@/components/ui/border-beam"
import { Confetti, type ConfettiRef } from "@/components/ui/confetti"
import { cn } from "@/lib/utils"
import { useAgent } from "@/hooks/use-queries"

interface ProvisionLogEntry {
  step: string
  status: "ok" | "pending" | "error"
  ts: number
}

// Map technical provision messages → friendly business language
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

const deployableTemplates = AGENT_TEMPLATES.filter((template) => template.status === "deployable")
const selectablePlans = FIRECLAW_PLANS.filter((plan) => plan.id !== "custom")
const steps = ["Agent", "Plan", "Name", "Deploy"]

export function DeployWizardClient() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const confettiRef = useRef<ConfettiRef>(null)
  const [step, setStep] = useState(0)
  const [templateId, setTemplateId] = useState(deployableTemplates[0]?.id ?? "customer-support")
  const [planId, setPlanId] = useState("starter")
  const [name, setName] = useState("")
  const [deploying, setDeploying] = useState(false)
  const [deployed, setDeployed] = useState(false)
  const [deployError, setDeployError] = useState<string | null>(null)
  const [agentId, setAgentId] = useState<string | null>(null)

  const selectedTemplate = deployableTemplates.find((template) => template.id === templateId) ?? deployableTemplates[0]
  const selectedPlan = getPlan(planId)
  const templateAllowed = selectedTemplate ? isTemplateAvailableOnPlan(selectedTemplate.id, selectedPlan.id) : false

  const { data: polledAgent } = useAgent(agentId, {
    refetchInterval: deploying && !deployed && !deployError ? 3000 : false,
  })

  const provisionLog = polledAgent?.provisionLog ?? []
  const agentDomain = polledAgent?.domain ?? null

  useEffect(() => {
    if (!selectedTemplate || isTemplateAvailableOnPlan(selectedTemplate.id, planId)) return
    setPlanId(selectedTemplate.minimumPlan)
  }, [planId, selectedTemplate])

  useEffect(() => {
    if (!polledAgent || deployed || deployError) return

    const logShowsLive = polledAgent.provisionLog?.some(
      (entry: ProvisionLogEntry) => entry.step.includes("Live at") && entry.status === "ok",
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
    if (step === 0) return !!selectedTemplate
    if (step === 1) return !!selectedPlan && templateAllowed
    if (step === 2) return name.trim().length > 0
    return false
  }

  const handleDeploy = useCallback(async () => {
    setDeploying(true)
    setDeployError(null)

    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          template: templateId,
          planId,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error ?? "Deploy failed")
      }

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
      setStep((current) => current + 1)
    }
  }

  return (
    <div className="p-6 lg:p-8">
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
              Pick the job, choose capacity, and FireClaw handles infrastructure and AI keys.
            </p>
          </div>

          <div className="mb-10 flex items-center justify-center gap-2">
            {steps.map((label, index) => (
              <div key={label} className="flex items-center gap-2">
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
                {index < steps.length - 1 && (
                  <div className={cn("h-px w-6 transition-colors", index < step ? "bg-emerald-500" : "bg-neutral-200")} />
                )}
              </div>
            ))}
          </div>

          {step === 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {deployableTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setTemplateId(template.id)}
                  className={cn(
                    "relative min-h-38 overflow-hidden rounded-xl border p-5 text-left transition-all",
                    templateId === template.id
                      ? "border-neutral-900 bg-white shadow-md"
                      : "border-neutral-200 bg-white hover:border-neutral-300",
                  )}
                >
                  {templateId === template.id && <BorderBeam size={90} borderWidth={1.5} colorFrom="#f97316" colorTo="#fbbf24" />}
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                      {template.category}
                    </span>
                    <span className="text-[11px] font-medium text-orange-600">{getPlan(template.minimumPlan).name}+</span>
                  </div>
                  <h2 className="text-[16px] font-bold text-neutral-900">{template.name}</h2>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">{template.description}</p>
                  <p className="mt-3 text-[11px] font-medium text-neutral-400">
                    Managed MiniMax included. No AI key needed.
                  </p>
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-4 md:grid-cols-3">
              {selectablePlans.map((plan) => {
                const allowed = selectedTemplate ? isTemplateAvailableOnPlan(selectedTemplate.id, plan.id) : false
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => allowed && setPlanId(plan.id)}
                    disabled={!allowed}
                    className={cn(
                      "relative flex min-h-88 flex-col overflow-hidden rounded-xl border p-5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-45",
                      planId === plan.id
                        ? "border-neutral-900 bg-white shadow-md"
                        : "border-neutral-200 bg-white hover:border-neutral-300",
                    )}
                  >
                    {planId === plan.id && <BorderBeam size={110} borderWidth={1.5} colorFrom="#f97316" colorTo="#fbbf24" />}
                    {plan.highlighted && (
                      <span className="mb-3 w-fit rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                        Popular
                      </span>
                    )}
                    <h2 className="text-[17px] font-bold text-neutral-900">{plan.name}</h2>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-[34px] font-black tracking-[-0.04em] text-neutral-900">{plan.price}</span>
                      <span className="text-[12px] font-medium text-neutral-400">{plan.period}</span>
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">{plan.description}</p>
                    <div className="mt-4 rounded-lg bg-neutral-50 p-3 text-[12px] font-semibold text-neutral-700">
                      {plan.agentLimit} deployed agent{plan.agentLimit > 1 ? "s" : ""}
                    </div>
                    <ul className="mt-4 flex flex-1 flex-col gap-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-[12px] text-neutral-600">
                          <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {!allowed && (
                      <p className="mt-3 text-[11px] font-medium text-red-500">
                        This template needs {getPlan(selectedTemplate?.minimumPlan).name} or higher.
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {step === 2 && (
            <div className="mx-auto max-w-xl space-y-5">
              <label className="block">
                <span className="mb-2 block text-[13px] font-semibold text-neutral-700">Agent name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={`${selectedTemplate?.name ?? "Business"} agent`}
                  autoFocus
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
                />
              </label>
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-orange-600" />
                  <div>
                    <p className="text-[13px] font-bold text-orange-900">
                      {selectedTemplate?.name} on {selectedPlan.name}
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed text-orange-700">
                      FireClaw will pick the most cost-effective healthy region, configure SSL, and attach managed MiniMax access.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="mx-auto max-w-xl space-y-6">
              {/* Progress card */}
              {!deployed && !deployError && (
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                  <div className="border-b border-neutral-100 bg-neutral-50 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-full bg-violet-100">
                        <Bot className="size-4 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">{name}</p>
                        <p className="text-xs text-neutral-500">{selectedTemplate?.name} · {selectedPlan.name} plan</p>
                      </div>
                      <div className="ml-auto flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                        <Loader2 className="size-3 animate-spin" />
                        Setting up
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-neutral-100">
                    {provisionLog.length === 0 ? (
                      <div className="flex items-center gap-3 px-5 py-4">
                        <Loader2 className="size-4 shrink-0 animate-spin text-neutral-400" />
                        <span className="text-sm text-neutral-500">Getting things ready…</span>
                      </div>
                    ) : (
                      provisionLog.map((entry: ProvisionLogEntry, index: number) => (
                        <div key={`${entry.ts}-${index}`} className="flex items-center gap-3 px-5 py-3.5">
                          {entry.status === "ok" && <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />}
                          {entry.status === "pending" && <Loader2 className="size-4 shrink-0 animate-spin text-amber-500" />}
                          {entry.status === "error" && <XCircle className="size-4 shrink-0 text-red-500" />}
                          <span className={cn(
                            "text-sm",
                            entry.status === "ok" && "text-neutral-700",
                            entry.status === "pending" && "text-neutral-900 font-medium",
                            entry.status === "error" && "text-red-700",
                          )}>
                            {friendlyStep(entry.step)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t border-neutral-100 bg-neutral-50 px-5 py-3">
                    <p className="text-xs text-neutral-400">This usually takes 60–90 seconds. You can leave this page — we'll email you when it's ready.</p>
                  </div>
                </div>
              )}

              {/* Error state */}
              {deployError && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
                  <XCircle className="mt-0.5 size-5 shrink-0 text-red-500" />
                  <div>
                    <p className="text-sm font-semibold text-red-900">Setup didn't complete</p>
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

              {/* Success state */}
              {deployed && (
                <div className="flex flex-col items-center gap-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
                  <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 className="size-7 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-neutral-900">{name} is live</p>
                    <p className="mt-1 text-sm text-neutral-500">Your agent is running and ready to work.</p>
                  </div>
                  {agentDomain && (
                    <a
                      href={`https://${agentDomain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm ring-1 ring-neutral-200 hover:bg-neutral-50"
                    >
                      Open agent
                      <ExternalLink className="size-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => agentId && router.push(`/dashboard/agents/${agentId}`)}
                    className="rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700"
                  >
                    Go to dashboard
                  </button>
                </div>
              )}

              <Confetti ref={confettiRef} className="pointer-events-none absolute left-0 top-0 z-50 size-full" />
            </div>
          )}

          {step < 3 && (
            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep((current) => Math.max(0, current - 1))}
                disabled={step === 0}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium transition-colors",
                  step === 0 ? "cursor-not-allowed text-neutral-300" : "text-neutral-600 hover:bg-neutral-100",
                )}
              >
                <ArrowLeft className="size-3.5" />
                Back
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={!canNext()}
                className={cn(
                  "flex items-center gap-2 rounded-full px-6 py-2.5 text-[13px] font-semibold transition-all",
                  canNext()
                    ? "bg-neutral-900 text-white hover:bg-neutral-700 active:scale-[0.97]"
                    : "cursor-not-allowed bg-neutral-200 text-neutral-400",
                )}
              >
                {step === 2 ? "Deploy Agent" : "Continue"}
                {step === 2 ? <Rocket className="size-3.5" /> : <ArrowRight className="size-3.5" />}
              </button>
            </div>
          )}
        </div>
      </BlurFade>
    </div>
  )
}
