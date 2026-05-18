import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getAgentsByUser } from "@/lib/agents"
import { OverviewClient } from "@/components/dashboard/overview-client"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const agents = await getAgentsByUser(session.user.id)

  const mapped = agents.map((a) => ({
    id: String(a._id),
    name: a.name,
    status: a.status as "provisioning" | "running" | "stopped" | "error",
    region: a.region ?? "us-east",
    createdAt: a.createdAt?.toString() ?? new Date().toISOString(),
  }))

  const runningCount = mapped.filter((a) => a.status === "running").length
  const errorCount = mapped.filter((a) => a.status === "error").length

  return (
    <OverviewClient
      agentCount={mapped.length}
      runningCount={runningCount}
      errorCount={errorCount}
      agents={mapped}
    />
  )
}
