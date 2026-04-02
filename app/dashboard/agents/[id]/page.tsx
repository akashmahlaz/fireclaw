import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getAgentById } from "@/lib/agents"
import { AgentDetailClient } from "@/components/dashboard/agent-detail"

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/api/auth/signin")

  const { id } = await params
  const agent = await getAgentById(id, session.user.id)

  if (!agent) {
    redirect("/dashboard/agents")
  }

  return (
    <AgentDetailClient
      agent={{
        id: agent._id!.toString(),
        name: agent.name,
        status: agent.status,
        region: agent.region,
        serverIp: agent.serverIp ?? null,
        serverId: agent.serverId ?? null,
        domain: agent.domain ?? null,
        gatewayToken: agent.gatewayToken ?? null,
        template: agent.template,
        messageCount: agent.messageCount,
        createdAt: agent.createdAt.toISOString(),
        updatedAt: agent.updatedAt.toISOString(),
      }}
    />
  )
}
