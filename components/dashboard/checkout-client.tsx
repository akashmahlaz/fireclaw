"use client"

import { useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  CreditCard,
  CheckCircle2,
  Loader2,
  Shield,
  Zap,
  ArrowLeft,
} from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"
import { BorderBeam } from "@/components/ui/border-beam"
import { cn } from "@/lib/utils"
import { useSubscription } from "@/hooks/use-queries"
import { useQueryClient } from "@tanstack/react-query"

interface CheckoutClientProps {
  user: { name: string; email: string }
}

const PLANS = [
  {
    id: "starter",
    label: "Starter",
    desc: "1 agent, perfect for trying out",
    agentLimit: 1,
    popular: false,
  },
  {
    id: "standard",
    label: "Standard",
    desc: "3 agents, moderate traffic",
    agentLimit: 3,
    popular: true,
  },
  {
    id: "pro",
    label: "Pro",
    desc: "10 agents, multi-channel",
    agentLimit: 10,
    popular: false,
  },
  {
    id: "enterprise",
    label: "Enterprise",
    desc: "Unlimited agents, high traffic",
    agentLimit: 100,
    popular: false,
  },
]

export function CheckoutClient({ user }: CheckoutClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const preselectedTier = searchParams.get("tier") || "standard"

  const [selectedTier, setSelectedTier] = useState(preselectedTier)
  const [paying, setPaying] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: subData } = useSubscription()

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

  const handleCheckout = useCallback(async () => {
    setPaying(true)
    setError(null)

    try {
      const scriptReady = await loadRazorpayScript()
      if (!scriptReady || !window.Razorpay) throw new Error("Razorpay SDK failed to load")

      // 1. Create Razorpay order
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: selectedTier,
          agentName: `${selectedTier} plan subscription`,
        }),
      })
      if (!orderRes.ok) throw new Error("Could not create payment order")
      const order = await orderRes.json()

      // 2. Open Razorpay modal
      const RazorpayCtor = window.Razorpay!
      await new Promise<{ paymentId: string; orderId: string; signature: string }>((resolve, reject) => {
        const instance = new RazorpayCtor({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "FireClaw",
          description: `${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Plan`,
          order_id: order.id,
          prefill: { name: user.name, email: user.email },
          theme: { color: "#171717" },
          handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            try {
              // 3. Verify payment
              const verifyRes = await fetch("/api/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                }),
              })
              if (!verifyRes.ok) throw new Error("Payment verification failed")

              // 4. Activate subscription
              const activateRes = await fetch("/api/subscription/activate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  tier: selectedTier,
                  paymentId: response.razorpay_payment_id,
                }),
              })
              if (!activateRes.ok) throw new Error("Subscription activation failed")

              resolve({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
              })
            } catch (err) {
              reject(err)
            }
          },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled")),
          },
        })
        instance.open()
      })

      // Success!
      setSuccess(true)
      queryClient.invalidateQueries({ queryKey: ["subscription"] })
    } catch (err) {
      if (err instanceof Error && err.message === "Payment cancelled") {
        setError(null) // User cancelled, not an error
      } else {
        setError(err instanceof Error ? err.message : "Payment failed")
      }
    } finally {
      setPaying(false)
    }
  }, [selectedTier, user, loadRazorpayScript, queryClient])

  if (success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <BlurFade inView delay={0}>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-100">
              <CheckCircle2 className="size-8 text-emerald-600" />
            </div>
            <h1 className="text-[24px] font-black tracking-[-0.03em] text-neutral-900">
              You&apos;re all set!
            </h1>
            <p className="max-w-sm text-[14px] text-neutral-500">
              Your <span className="font-semibold text-neutral-900">{selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}</span> plan is now active.
              You can deploy agents from your dashboard.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => router.push("/dashboard/deploy")}
                className="rounded-full bg-neutral-900 px-6 py-2.5 text-[13px] font-semibold text-white hover:bg-neutral-700"
              >
                Deploy Agent
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="rounded-full border border-neutral-200 bg-white px-6 py-2.5 text-[13px] font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Dashboard
              </button>
            </div>
          </div>
        </BlurFade>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <BlurFade inView delay={0}>
        <div className="mx-auto max-w-3xl">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-[13px] font-medium text-neutral-500 hover:text-neutral-700"
          >
            <ArrowLeft className="size-3.5" />
            Back
          </button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[28px] font-black tracking-[-0.03em] text-neutral-900">
              Choose your plan
            </h1>
            <p className="mt-1 text-[14px] text-neutral-500">
              {subData?.subscription
                ? `You're currently on the ${subData.subscription.tier} plan. Select a new plan to switch.`
                : "Select a plan to start deploying AI agents."}
            </p>
          </div>

          {/* Plan cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            {PLANS.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedTier(plan.id)}
                className={cn(
                  "relative overflow-hidden rounded-2xl border-2 p-6 text-left transition-all",
                  selectedTier === plan.id
                    ? "border-neutral-900 bg-white shadow-lg"
                    : "border-neutral-200 bg-white hover:border-neutral-300",
                )}
              >
                {selectedTier === plan.id && (
                  <BorderBeam size={80} borderWidth={1.5} colorFrom="#171717" colorTo="#525252" />
                )}
                {plan.popular && (
                  <span className="absolute right-4 top-4 rounded-full bg-orange-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    Popular
                  </span>
                )}

                <h3 className="text-[18px] font-bold text-neutral-900">{plan.label}</h3>
                <p className="mt-1 text-[13px] text-neutral-500">{plan.desc}</p>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-[11px] font-medium text-neutral-400">
                    {plan.agentLimit === 100 ? "Unlimited" : plan.agentLimit} agent{plan.agentLimit > 1 ? "s" : ""}
                  </span>
                </div>

                {subData?.subscription?.tier === plan.id && (
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    <CheckCircle2 className="size-3" />
                    Current plan
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Checkout section */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-neutral-100">
                <CreditCard className="size-5 text-neutral-600" />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-neutral-900">Payment</h2>
                <p className="text-[12px] text-neutral-500">
                  Secure checkout via Razorpay
                </p>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mb-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-[12px] text-neutral-500">
                <Shield className="size-3.5 text-emerald-500" />
                256-bit SSL encryption
              </div>
              <div className="flex items-center gap-2 text-[12px] text-neutral-500">
                <Zap className="size-3.5 text-orange-500" />
                Instant activation
              </div>
            </div>

            {error && (
              <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-[13px] font-medium text-red-600">
                {error}
              </p>
            )}

            <button
              onClick={handleCheckout}
              disabled={paying || (subData?.subscription?.tier === selectedTier)}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[14px] font-semibold transition-all",
                "bg-neutral-900 text-white hover:bg-neutral-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {paying ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Processing...
                </>
              ) : subData?.subscription?.tier === selectedTier ? (
                "Already on this plan"
              ) : subData?.subscription ? (
                `Switch to ${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}`
              ) : (
                `Subscribe to ${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}`
              )}
            </button>

            <p className="mt-3 text-center text-[11px] text-neutral-400">
              Pay per deploy. Your agent VPS costs are charged separately at deploy time.
            </p>
          </div>
        </div>
      </BlurFade>
    </div>
  )
}
