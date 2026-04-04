import { auth } from "@/auth"
import { getUserSubscription, checkDeployQuota } from "@/lib/subscriptions"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [sub, quota] = await Promise.all([
    getUserSubscription(session.user.id),
    checkDeployQuota(session.user.id),
  ])

  return Response.json({
    subscription: sub
      ? {
          tier: sub.tier,
          status: sub.status,
          agentLimit: sub.agentLimit,
          currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
        }
      : null,
    quota: {
      allowed: quota.allowed,
      used: quota.used,
      limit: quota.limit,
      tier: quota.tier,
    },
  })
}
