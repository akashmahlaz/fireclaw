import { auth } from "@/auth"
import { createSubscription, getActiveSubscription, updateSubscriptionStatus } from "@/lib/subscriptions"
import { rateLimitByUser } from "@/lib/rate-limit"
import { sendPaymentReceivedEmail } from "@/lib/email"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Rate limit: 5 subscription activations per hour
  const rl = rateLimitByUser(session.user.id, "subscription:activate", 5, 60 * 60 * 1000)
  if (rl) return rl

  const body = await request.json()
  const { tier, paymentId } = body

  const allowedTiers = ["starter", "standard", "pro", "enterprise"] as const
  if (!allowedTiers.includes(tier)) {
    return Response.json({ error: "Invalid tier" }, { status: 400 })
  }

  if (!paymentId || typeof paymentId !== "string") {
    return Response.json({ error: "Payment ID is required" }, { status: 400 })
  }

  // Cancel any existing active subscription before creating new one
  const existing = await getActiveSubscription(session.user.id)
  if (existing) {
    await updateSubscriptionStatus(session.user.id, "cancelled")
  }

  const subscription = await createSubscription({
    userId: session.user.id,
    tier,
    lastPaymentId: paymentId,
  })

  // Send payment confirmation email (non-blocking)
  if (session.user.email) {
    const tierLabels: Record<string, string> = {
      starter: "Starter",
      standard: "Standard",
      pro: "Pro",
      enterprise: "Enterprise",
    }
    sendPaymentReceivedEmail(
      session.user.email,
      tierLabels[tier] ?? tier,
      `${tier} plan`,
    ).catch(() => {})
  }

  return Response.json({
    success: true,
    subscription: {
      tier: subscription.tier,
      status: subscription.status,
      agentLimit: subscription.agentLimit,
      currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
    },
  }, { status: 201 })
}
