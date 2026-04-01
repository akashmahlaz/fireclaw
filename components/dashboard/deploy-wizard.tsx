"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Rocket,
  ArrowRight,
  ArrowLeft,
  Globe,
  Server,
  Key,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"
import { BorderBeam } from "@/components/ui/border-beam"
import { cn } from "@/lib/utils"
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/ui/terminal"
import { Confetti, type ConfettiRef } from "@/components/ui/confetti"
import { useRef } from "react"

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

const steps = ["Name", "Region", "Tier", "API Key", "Deploy"]

const regions = [
  { id: "eu-central", label: "Frankfurt", flag: "🇩🇪", latency: "~20ms" },
  { id: "us-east", label: "Virginia", flag: "🇺🇸", latency: "~45ms" },
  { id: "ap-south", label: "Mumbai", flag: "🇮🇳", latency: "~60ms" },
]

const tiers = [
  { id: "starter", label: "Starter", price: "$7.99", specs: "2 vCPU · 4 GB · 80 GB", desc: "Personal use, light traffic" },
  { id: "standard", label: "Standard", price: "$14.99", specs: "4 vCPU · 8 GB · 160 GB", desc: "Small business, moderate traffic", popular: true },
  { id: "pro", label: "Pro", price: "$29.99", specs: "6 vCPU · 16 GB · 320 GB", desc: "High traffic, multi-channel" },
  { id: "enterprise", label: "Enterprise", price: "$59.99", specs: "8 vCPU · 32 GB · 640 GB", desc: "Agency-level, max performance" },
]

export function DeployWizardClient() {
  const router = useRouter()
  const confettiRef = useRef<ConfettiRef>(null)
  const [step, setStep] = useState(0)
  const [deploying, setDeploying] = useState(false)
  const [paying, setPaying] = useState(false)
  const [paymentVerified, setPaymentVerified] = useState(false)
  const [deployed, setDeployed] = useState(false)
  const [agentId, setAgentId] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState("")
  const [region, setRegion] = useState("eu-central")
  const [tier, setTier] = useState("standard")
  const [apiKey, setApiKey] = useState("")

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
        body: JSON.stringify({ tier, agentName: name.trim() || "OpenClaw Agent" }),
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

              setPaymentVerified(true)
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
    if (step === 1) return !!region
    if (step === 2) return !!tier
    if (step === 3) return true // API key is optional
    return false
  }

  const handleDeploy = useCallback(async () => {
    setDeploying(true)
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
      setDeployed(true)
      setTimeout(() => {
        confettiRef.current?.fire({})
      }, 500)
    } catch {
      alert("Deploy failed. Please try again.")
    } finally {
      setDeploying(false)
    }
  }, [name, region, tier, apiKey])

  const goNext = () => {
    if (step === 3) {
      ;(async () => {
        try {
          await startPayment()
          setStep(4)
          await handleDeploy()
        } catch {
          alert("Payment did not complete. Please try again.")
        }
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
              <div className="grid gap-3 sm:grid-cols-3">
                {regions.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRegion(r.id)}
                    className={cn(
                      "relative overflow-hidden rounded-2xl border-2 p-5 text-left transition-all",
                      region === r.id
                        ? "border-neutral-900 bg-white shadow-md"
                        : "border-neutral-200 bg-white hover:border-neutral-300"
                    )}
                  >
                    {region === r.id && (
                      <BorderBeam size={60} borderWidth={1.5} colorFrom="#f97316" colorTo="#fbbf24" />
                    )}
                    <div className="mb-2 text-[28px]">{r.flag}</div>
                    <p className="text-[14px] font-bold text-neutral-900">{r.label}</p>
                    <p className="text-[11px] text-neutral-400">{r.latency} from you</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="mb-1 text-[13px] font-semibold text-neutral-700">Select plan</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {tiers.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTier(t.id)}
                    className={cn(
                      "relative overflow-hidden rounded-2xl border-2 p-5 text-left transition-all",
                      tier === t.id
                        ? "border-neutral-900 bg-white shadow-md"
                        : "border-neutral-200 bg-white hover:border-neutral-300"
                    )}
                  >
                    {tier === t.id && (
                      <BorderBeam size={80} borderWidth={1.5} colorFrom="#f97316" colorTo="#fbbf24" />
                    )}
                    {t.popular && (
                      <span className="absolute right-3 top-3 rounded-full bg-orange-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                        Popular
                      </span>
                    )}
                    <p className="text-[20px] font-black text-neutral-900">{t.price}</p>
                    <p className="text-[12px] font-medium text-neutral-500">/month</p>
                    <p className="mt-2 text-[13px] font-bold text-neutral-700">{t.label}</p>
                    <p className="text-[11px] text-neutral-400">{t.specs}</p>
                    <p className="mt-1 text-[11px] text-neutral-400">{t.desc}</p>
                  </button>
                ))}
              </div>
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
              <p className="text-[12px] font-medium text-orange-600">
                Next step will open secure Razorpay checkout for your selected plan.
              </p>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <Terminal className="w-full !max-w-none !max-h-none rounded-2xl !border-neutral-800 !bg-neutral-950">
                <TypingAnimation className="text-green-400">
                  {`> fireclaw deploy "${name}" --region ${region} --tier ${tier}`}
                </TypingAnimation>

                <AnimatedSpan className="text-emerald-400">
                  <span>
                    {paymentVerified ? "  ✓ Payment verified" : "  … Waiting for payment verification"}
                  </span>
                </AnimatedSpan>

                <AnimatedSpan className="text-neutral-500">
                  <span>  Provisioning dedicated VPS...</span>
                </AnimatedSpan>

                <AnimatedSpan className="text-emerald-400">
                  <span>  ✓ VPS created in {regions.find((r) => r.id === region)?.label}</span>
                </AnimatedSpan>

                <AnimatedSpan className="text-emerald-400">
                  <span>  ✓ Docker + OpenClaw installed</span>
                </AnimatedSpan>

                <AnimatedSpan className="text-emerald-400">
                  <span>  ✓ SSL certificate provisioned</span>
                </AnimatedSpan>

                <AnimatedSpan className="text-emerald-400">
                  <span>  ✓ Health check passed</span>
                </AnimatedSpan>

                <AnimatedSpan className="text-white font-semibold">
                  <span>  🚀 {name} is live!</span>
                </AnimatedSpan>

                <TypingAnimation className="text-orange-400">
                  {"  → Open your OpenClaw dashboard to connect channels"}
                </TypingAnimation>
              </Terminal>

              {deployed && (
                <BlurFade inView delay={0.1}>
                  <div className="flex flex-col items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                    <CheckCircle2 className="size-8 text-emerald-500" />
                    <p className="text-[15px] font-bold text-neutral-900">
                      Agent deployed successfully!
                    </p>
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
