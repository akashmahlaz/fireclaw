import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getAgentsByUser } from "@/lib/agents"
import { AgentsClient } from "@/components/dashboard/agents-client"

export default async function AgentsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const agents = await getAgentsByUser(session.user.id)

  return (
    <AgentsClient
      agents={agents.map((a) => ({
        id: a._id!.toString(),
        name: a.name,
        status: a.status,
        region: a.region,
        serverIp: a.serverIp ?? null,
        template: a.template,
        messageCount: a.messageCount,
        createdAt: a.createdAt.toISOString(),
      }))}
    />
  )
}
