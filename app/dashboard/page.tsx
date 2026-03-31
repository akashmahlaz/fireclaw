import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getAgentsByUser, countAgentsByUser } from "@/lib/agents"
import { OverviewClient } from "@/components/dashboard/overview-client"

export default async function DashboardOverview() {
  const session = await auth()
  if (!session?.user?.id) redirect("/api/auth/signin")

  const [agents, agentCount] = await Promise.all([
    getAgentsByUser(session.user.id),
    countAgentsByUser(session.user.id),
  ])

  const running = agents.filter((a) => a.status === "running").length
  const errors = agents.filter((a) => a.status === "error").length

  return (
    <OverviewClient
      agentCount={agentCount}
      runningCount={running}
      errorCount={errors}
      agents={agents.map((a) => ({
        id: a._id!.toString(),
        name: a.name,
        status: a.status,
        region: a.region,
        createdAt: a.createdAt.toISOString(),
      }))}
    />
  )
}
