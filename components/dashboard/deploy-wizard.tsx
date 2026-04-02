"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Rocket,
  ArrowRight,
  ArrowLeft,
  Key,
  CheckCircle2,
  Loader2,
  Circle,
  XCircle,
} from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"
import { BorderBeam } from "@/components/ui/border-beam"
import { cn } from "@/lib/utils"
import { Confetti, type ConfettiRef } from "@/components/ui/confetti"

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string
      amount: number
      currency: string
      name: string
      description: string
      order_id: string
      prefill?: { name?: string; email?: string; contact?: string }
      theme?: { color?: string }
      handler: (response: {
        razorpay_order_id: string
        razorpay_payment_id: string
        razorpay_signature: string
      }) => void
      modal?: { ondismiss?: () => void }
    }) => { open: () => void }
  }
}

interface ProvisionLogEntry {
  step: string
  status: "ok" | "pending" | "error"
  ts: number
}

const steps = ["Name", "Region", "Tier", "API Key", "Deploy"]

/* ── Types for live availability data (provider-agnostic) ─────────── */
interface TierOption {
  guaranteedType: string
  fallbackChain: string[]
  cores: number
  memory: number
  disk: number
  providerCostUsd: number
  priceUsd: number
  priceInr: number
  architecture: "x86" | "arm"
}

interface LocationInfo {
  id: string
  label: string
  country: string
  region: string
  tiers: Record<string, TierOption>
}

interface AvailabilityData {
  provider: string
  locations: LocationInfo[]
  tierDefs: { id: string; label: string; minCores: number; minMemory: number }[]
}

const TIER_LABELS: Record<string, { label: string; desc: string; popular?: boolean }> = {
  starter: { label: "Starter", desc: "Single agent, light traffic — cheapest" },
  standard: { label: "Standard", desc: "Personal use, moderate traffic", popular: true },
  pro: { label: "Pro", desc: "Small business, multi-channel" },
  enterprise: { label: "Enterprise", desc: "Agency-level, high traffic" },
}

function formatInr(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`
}

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

const REGION_LABELS: Record<string, string> = {
  fsn1: "Falkenstein, Germany",
  nbg1: "Nuremberg, Germany",
  hel1: "Helsinki, Finland",
  ash: "Ashburn, Virginia (US)",
  hil: "Hillsboro, Oregon (US)",
  sin: "Singapore, Asia Pacific",
}

export function DeployWizardClient() {
  const router = useRouter()
  const confettiRef = useRef<ConfettiRef>(null)
  const [step, setStep] = useState(0)
  const [deploying, setDeploying] = useState(false)
  const [paying, setPaying] = useState(false)
  const [deployed, setDeployed] = useState(false)
  const [deployError, setDeployError] = useState<string | null>(null)
  const [agentId, setAgentId] = useState<string | null>(null)
  const [agentDomain, setAgentDomain] = useState<string | null>(null)
  const [provisionLog, setProvisionLog] = useState<ProvisionLogEntry[]>([])

  // Live availability from Hetzner
  const [availability, setAvailability] = useState<AvailabilityData | null>(null)
  const [availLoading, setAvailLoading] = useState(true)

  // Form state
  const [name, setName] = useState("")
  const [region, setRegion] = useState("")
  const [tier, setTier] = useState("")
  const [apiKey, setApiKey] = useState("")

  // Fetch live availability on mount
  useEffect(() => {
    fetch("/api/hetzner/availability")
      .then((r) => r.json())
      .then((data: AvailabilityData) => {
        setAvailability(data)
        // Default to first location
        if (data.locations.length > 0 && !region) {
          setRegion(data.locations[0].id)
        }
      })
      .catch((err) => console.error("Failed to load availability:", err))
      .finally(() => setAvailLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-select first available tier when region changes
  useEffect(() => {
    if (!availability) return
    const loc = availability.locations.find((l) => l.id === region)
    if (!loc) return
    const availTiers = Object.keys(loc.tiers)
    if (availTiers.length > 0 && (!tier || !loc.tiers[tier])) {
      setTier(availTiers.includes("starter") ? "starter" : availTiers[0])
    }
  }, [region, availability]) // eslint-disable-line react-hooks/exhaustive-deps

  // Helper: get current location & tier option
  const currentLocation = availability?.locations.find((l) => l.id === region)
  const currentTierOption = currentLocation?.tiers[tier]

  // Poll agent status once deploying
  useEffect(() => {
    if (!agentId || deployed || deployError) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/agents/${agentId}`)
        if (!res.ok) return
        const agent = await res.json()

        if (agent.provisionLog) {
          setProvisionLog(agent.provisionLog)
        }
        if (agent.domain) {
          setAgentDomain(agent.domain)
        }

        if (agent.status === "running") {
          setDeployed(true)
          setDeploying(false)
          clearInterval(interval)
          setTimeout(() => confettiRef.current?.fire({}), 500)
        } else if (agent.status === "error") {
          setDeployError("Provisioning failed. Check logs below.")
          setDeploying(false)
          clearInterval(interval)
        }
      } catch {
        // Ignore transient fetch errors
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [agentId, deployed, deployError])

  const loadRazorpayScript = useCallback(async () => {
    if (window.Razorpay) return true

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error("Failed to load Razorpay"))
      document.body.appendChild(script)
    })

    return !!window.Razorpay
  }, [])

  const startPayment = useCallback(async () => {
    setPaying(true)
    try {
      const scriptReady = await loadRazorpayScript()
      if (!scriptReady || !window.Razorpay) {
        throw new Error("Razorpay SDK failed to load")
      }

      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          region,
          priceInr: currentTierOption?.priceInr,
          agentName: name.trim() || "OpenClaw Agent",
        }),
      })

      if (!orderRes.ok) {
        throw new Error("Could not create payment order")
      }

      const order = await orderRes.json()
      const RazorpayCtor = window.Razorpay
      if (!RazorpayCtor) {
        throw new Error("Razorpay SDK unavailable")
      }

      await new Promise<void>((resolve, reject) => {
        const instance = new RazorpayCtor({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "FireClaw",
          description: `${tier.toUpperCase()} plan deployment`,
          order_id: order.id,
          theme: { color: "#f97316" },
          handler: async (response) => {
            try {
              const verifyRes = await fetch("/api/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                }),
              })

              if (!verifyRes.ok) {
                throw new Error("Payment verification failed")
              }

              resolve()
            } catch (error) {
              reject(error)
            }
          },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled")),
          },
        })

        instance.open()
      })
    } finally {
      setPaying(false)
    }
  }, [loadRazorpayScript, name, tier])

  const canNext = () => {
    if (step === 0) return name.trim().length > 0
    if (step === 1) return !!region && !!currentLocation
    if (step === 2) return !!tier && !!currentTierOption
    if (step === 3) return true
    return false
  }

  const handleDeploy = useCallback(async () => {
    setDeploying(true)
    setDeployError(null)
    setProvisionLog([])
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          template: "custom",
          region,
          tier,
          apiKey: apiKey.trim(),
        }),
      })
      if (!res.ok) throw new Error("Deploy failed")
      const data = await res.json()
      setAgentId(data._id)
      // Polling starts via useEffect
    } catch {
      setDeployError("Failed to start deployment. Please try again.")
      setDeploying(false)
    }
  }, [name, region, tier, apiKey])

  const goNext = () => {
    if (step === 3) {
      ;(async () => {
        // TODO: re-enable payment after testing
        // try {
        //   await startPayment()
        //   setStep(4)
        //   await handleDeploy()
        // } catch {
        //   alert("Payment did not complete. Please try again.")
        // }
        setStep(4)
        await handleDeploy()
      })()
    } else {
      setStep((s) => s + 1)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <BlurFade inView delay={0}>
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-orange-100">
              <Rocket className="size-5 text-orange-600" />
            </div>
            <h1 className="text-[28px] font-black tracking-[-0.03em] text-neutral-900">
              Deploy New Agent
            </h1>
            <p className="mt-1 text-[14px] text-neutral-500">
              Launch a dedicated OpenClaw instance in under 60 seconds.
            </p>
          </div>

          {/* Step indicators */}
          <div className="mb-10 flex items-center justify-center gap-2">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-[11px] font-bold transition-all",
                    i < step && "bg-emerald-500 text-white",
                    i === step && "bg-neutral-900 text-white",
                    i > step && "bg-neutral-100 text-neutral-400",
                  )}
                >
                  {i < step ? <CheckCircle2 className="size-3.5" /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className={cn("h-px w-6 transition-colors", i < step ? "bg-emerald-500" : "bg-neutral-200")} />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          {step === 0 && (
            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-[13px] font-semibold text-neutral-700">Agent name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My OpenClaw Bot"
                  autoFocus
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
                />
              </label>
              <p className="text-[12px] text-neutral-400">
                This will be shown in your dashboard. You can change it later.
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <p className="mb-1 text-[13px] font-semibold text-neutral-700">Select region</p>
              {availLoading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-neutral-400">
                  <Loader2 className="size-4 animate-spin" />
                  <span className="text-[13px]">Loading available regions…</span>
                </div>
              ) : !availability || availability.locations.length === 0 ? (
                <p className="py-8 text-center text-[13px] text-red-500">
                  Could not load regions. Please refresh the page.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-3">
                  {availability.locations.map((loc) => {
                    const cheapest = Object.values(loc.tiers).reduce(
                      (min, t) => (t.priceUsd < min ? t.priceUsd : min),
                      Infinity,
                    )
                    const tierCount = Object.keys(loc.tiers).length
                    return (
                      <button
                        key={loc.id}
                        onClick={() => setRegion(loc.id)}
                        className={cn(
                          "relative overflow-hidden rounded-2xl border-2 p-5 text-left transition-all",
                          region === loc.id
                            ? "border-neutral-900 bg-white shadow-md"
                            : "border-neutral-200 bg-white hover:border-neutral-300",
                        )}
                      >
                        {region === loc.id && (
                          <BorderBeam size={60} borderWidth={1.5} colorFrom="#f97316" colorTo="#fbbf24" />
                        )}
                        <img
                          src={`https://flagcdn.com/w80/${loc.country}.png`}
                          alt={loc.label}
                          className="mb-2 h-7 w-auto rounded-sm"
                        />
                        <p className="text-[14px] font-bold text-neutral-900">{loc.label}</p>
                        <p className="text-[11px] text-neutral-400">
                          {REGION_LABELS[loc.id] ?? loc.id}
                        </p>
                        <p className="mt-1 text-[11px] font-medium text-orange-600">
                          from {formatUsd(cheapest)}/mo
                        </p>
                        <p className="text-[10px] text-neutral-300">
                          {tierCount} plan{tierCount > 1 ? "s" : ""} available
                        </p>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="mb-1 text-[13px] font-semibold text-neutral-700">
                Select plan
                {currentLocation && (
                  <span className="ml-2 font-normal text-neutral-400">
                    — {currentLocation.label} pricing
                  </span>
                )}
              </p>
              {!currentLocation ? (
                <p className="py-8 text-center text-[13px] text-red-500">
                  No plans available for selected region.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(currentLocation.tiers).map(([tierId, tierOpt]) => {
                    const meta = TIER_LABELS[tierId]
                    if (!meta) return null
                    return (
                      <button
                        key={tierId}
                        onClick={() => setTier(tierId)}
                        className={cn(
                          "relative overflow-hidden rounded-2xl border-2 p-5 text-left transition-all",
                          tier === tierId
                            ? "border-neutral-900 bg-white shadow-md"
                            : "border-neutral-200 bg-white hover:border-neutral-300",
                        )}
                      >
                        {tier === tierId && (
                          <BorderBeam size={80} borderWidth={1.5} colorFrom="#f97316" colorTo="#fbbf24" />
                        )}
                        {meta.popular && (
                          <span className="absolute right-3 top-3 rounded-full bg-orange-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                            Popular
                          </span>
                        )}
                        <p className="text-[20px] font-black text-neutral-900">
                          {formatUsd(tierOpt.priceUsd)}
                        </p>
                        <p className="text-[12px] font-medium text-neutral-500">/month</p>
                        <p className="mt-0.5 text-[10px] text-neutral-400">
                          Hetzner base: ${(tierOpt.providerCostUsd).toFixed(2)}/mo
                        </p>
                        <p className="mt-2 text-[13px] font-bold text-neutral-700">{meta.label}</p>
                        <p className="text-[11px] text-neutral-400">
                          {tierOpt.cores} vCPU · {tierOpt.memory} GB · {tierOpt.disk} GB
                          {tierOpt.architecture === "arm" && " · ARM"}
                        </p>
                        <p className="mt-1 text-[11px] text-neutral-400">{meta.desc}</p>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-neutral-700">
                  <Key className="size-3.5" />
                  AI Provider API Key
                  <span className="text-[11px] font-normal text-neutral-400">(optional)</span>
                </span>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 font-mono text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
                />
              </label>
              <p className="text-[12px] text-neutral-400">
                OpenAI or Anthropic key. You can configure this later in OpenClaw as well.
              </p>
              {currentTierOption && (
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                  <p className="text-[12px] font-medium text-orange-700">
                    You&apos;ll be charged <span className="font-bold">{formatUsd(currentTierOption.priceUsd)}/mo</span>{" "}
                    ({formatInr(currentTierOption.priceInr)}) for {TIER_LABELS[tier]?.label ?? tier} in {currentLocation?.label}.
                  </p>
                  <p className="mt-1 text-[11px] text-orange-600">
                    {currentTierOption.cores} vCPU · {currentTierOption.memory} GB RAM · {currentTierOption.disk} GB SSD
                    {currentTierOption.architecture === "arm" ? " · ARM" : " · x86"}
                  </p>
                  <p className="mt-1 text-[10px] text-orange-500">
                    Hetzner base cost: ${currentTierOption.providerCostUsd.toFixed(2)}/mo
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              {/* Live provision log */}
              <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-5 font-mono text-[13px] leading-relaxed">
                <p className="text-green-400">
                  {`> fireclaw deploy "${name}" --region ${region} --tier ${tier}`}
                </p>

                {provisionLog.length === 0 && deploying && (
                  <p className="mt-3 flex items-center gap-2 text-neutral-500">
                    <Loader2 className="size-3.5 animate-spin" />
                    Initializing deployment…
                  </p>
                )}

                {provisionLog.map((entry, i) => (
                  <p
                    key={i}
                    className={cn(
                      "mt-1",
                      entry.status === "ok" && "text-emerald-400",
                      entry.status === "pending" && "text-amber-400",
                      entry.status === "error" && "text-red-400",
                    )}
                  >
                    {entry.status === "ok" && <CheckCircle2 className="mr-1.5 inline size-3" />}
                    {entry.status === "pending" && <Circle className="mr-1.5 inline size-3" />}
                    {entry.status === "error" && <XCircle className="mr-1.5 inline size-3" />}
                    {entry.step}
                  </p>
                ))}

                {deploying && provisionLog.length > 0 && (
                  <p className="mt-2 flex items-center gap-2 text-neutral-500">
                    <Loader2 className="size-3.5 animate-spin" />
                    Provisioning in progress…
                  </p>
                )}

                {deployed && (
                  <p className="mt-3 text-[14px] font-semibold text-white">
                    🚀 {name} is live!
                  </p>
                )}
              </div>

              {/* Error state */}
              {deployError && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
                  <XCircle className="mt-0.5 size-5 shrink-0 text-red-500" />
                  <div>
                    <p className="text-[14px] font-bold text-red-900">{deployError}</p>
                    <button
                      onClick={() => router.push("/dashboard/agents")}
                      className="mt-2 text-[13px] font-medium text-red-700 underline hover:no-underline"
                    >
                      View agent details
                    </button>
                  </div>
                </div>
              )}

              {/* Success state */}
              {deployed && (
                <BlurFade inView delay={0.1}>
                  <div className="flex flex-col items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                    <CheckCircle2 className="size-8 text-emerald-500" />
                    <p className="text-[15px] font-bold text-neutral-900">
                      Agent deployed successfully!
                    </p>
                    {agentDomain && (
                      <p className="text-[13px] text-neutral-600">
                        Live at{" "}
                        <a
                          href={`https://${agentDomain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-orange-600 underline"
                        >
                          {agentDomain}
                        </a>
                      </p>
                    )}
                    <div className="flex gap-3">
                      <button
                        onClick={() => agentId && router.push(`/dashboard/agents/${agentId}`)}
                        className="rounded-full bg-neutral-900 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-neutral-700"
                      >
                        View Agent
                      </button>
                      <button
                        onClick={() => router.push("/dashboard/agents")}
                        className="rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-[13px] font-semibold text-neutral-700 hover:bg-neutral-50"
                      >
                        All Agents
                      </button>
                    </div>
                  </div>
                </BlurFade>
              )}

              <Confetti
                ref={confettiRef}
                className="pointer-events-none absolute left-0 top-0 z-50 size-full"
              />
            </div>
          )}

          {/* Navigation */}
          {step < 4 && (
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium transition-colors",
                  step === 0
                    ? "text-neutral-300 cursor-not-allowed"
                    : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                <ArrowLeft className="size-3.5" />
                Back
              </button>
              <button
                onClick={goNext}
                disabled={!canNext()}
                className={cn(
                  "flex items-center gap-2 rounded-full px-6 py-2.5 text-[13px] font-semibold transition-all",
                  canNext()
                    ? "bg-neutral-900 text-white hover:bg-neutral-700 active:scale-[0.97]"
                    : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                )}
              >
                {step === 3 ? (
                  <>
                    {paying ? <Loader2 className="size-3.5 animate-spin" /> : <Rocket className="size-3.5" />}
                    {paying ? "Opening Payment" : "Pay & Deploy"}
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="size-3.5" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </BlurFade>
    </div>
  )
}
