import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getAgentsByUser } from "@/lib/agents"
import { BillingClient } from "@/components/dashboard/billing-client"

export default async function BillingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  const agents = await getAgentsByUser(session.user.id)

  const prices: Record<string, number> = {
    starter: 7.99,
    standard: 14.99,
    pro: 29.99,
    enterprise: 59.99,
  }
  const totalMonthly = agents.reduce((sum, a) => {
    const tier = (a as unknown as { tier?: string }).tier
    return sum + (prices[tier ?? "starter"] ?? 7.99)
  }, 0)

  return (
    <BillingClient
      agentCount={agents.length}
      runningCount={agents.filter((a) => a.status === "running").length}
      totalMonthly={totalMonthly}
    />
  )
}
