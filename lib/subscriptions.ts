import { ObjectId } from "mongodb"
import client from "./db"

const DB_NAME = "fireclaw"

export type SubscriptionStatus = "active" | "halted" | "cancelled" | "expired"

export interface Subscription {
  _id?: ObjectId
  userId: string
  tier: "starter" | "standard" | "pro" | "enterprise"
  status: SubscriptionStatus
  agentLimit: number
  /** Razorpay subscription ID (if using Razorpay Subscriptions) */
  razorpaySubscriptionId?: string
  /** Last captured payment ID */
  lastPaymentId?: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  createdAt: Date
  updatedAt: Date
}

const TIER_LIMITS: Record<string, number> = {
  starter: 1,
  standard: 3,
  pro: 10,
  enterprise: 100,
}

function subscriptions() {
  return client.db(DB_NAME).collection<Subscription>("subscriptions")
}

export async function createSubscription(
  data: Pick<Subscription, "userId" | "tier" | "lastPaymentId" | "razorpaySubscriptionId">,
): Promise<Subscription> {
  const now = new Date()
  const periodEnd = new Date(now)
  periodEnd.setMonth(periodEnd.getMonth() + 1)

  const sub: Omit<Subscription, "_id"> = {
    userId: data.userId,
    tier: data.tier,
    status: "active",
    agentLimit: TIER_LIMITS[data.tier] ?? 1,
    razorpaySubscriptionId: data.razorpaySubscriptionId,
    lastPaymentId: data.lastPaymentId,
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    createdAt: now,
    updatedAt: now,
  }

  const result = await subscriptions().insertOne(sub as Subscription)
  return { ...sub, _id: result.insertedId }
}

export async function getActiveSubscription(userId: string): Promise<Subscription | null> {
  return subscriptions().findOne({
    userId,
    status: { $in: ["active"] },
  }) as Promise<Subscription | null>
}

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  return subscriptions().findOne(
    { userId },
    { sort: { createdAt: -1 } },
  ) as Promise<Subscription | null>
}

export async function updateSubscriptionStatus(
  userId: string,
  status: SubscriptionStatus,
): Promise<boolean> {
  const result = await subscriptions().updateOne(
    { userId, status: "active" },
    { $set: { status, updatedAt: new Date() } },
  )
  return result.modifiedCount === 1
}

export async function renewSubscription(userId: string, paymentId: string): Promise<boolean> {
  const now = new Date()
  const periodEnd = new Date(now)
  periodEnd.setMonth(periodEnd.getMonth() + 1)

  const result = await subscriptions().updateOne(
    { userId, status: "active" },
    {
      $set: {
        lastPaymentId: paymentId,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        updatedAt: now,
      },
    },
  )
  return result.modifiedCount === 1
}

/**
 * Check if user can deploy a new agent based on their subscription limits.
 * Returns { allowed, used, limit, reason? }
 */
export async function checkDeployQuota(userId: string): Promise<{
  allowed: boolean
  used: number
  limit: number
  tier: string | null
  reason?: string
}> {
  const sub = await getActiveSubscription(userId)

  // No subscription — allow first deploy (becomes their plan)
  if (!sub) {
    const { countAgentsByUser } = await import("./agents")
    const count = await countAgentsByUser(userId)
    // Allow deploy without subscription for first-time users  
    // They'll pay during the deploy wizard flow
    return { allowed: true, used: count, limit: 1, tier: null }
  }

  const { countAgentsByUser } = await import("./agents")
  const count = await countAgentsByUser(userId)

  if (count >= sub.agentLimit) {
    return {
      allowed: false,
      used: count,
      limit: sub.agentLimit,
      tier: sub.tier,
      reason: `You've reached the ${sub.tier} plan limit of ${sub.agentLimit} agent${sub.agentLimit > 1 ? "s" : ""}. Upgrade your plan to deploy more.`,
    }
  }

  return { allowed: true, used: count, limit: sub.agentLimit, tier: sub.tier }
}
